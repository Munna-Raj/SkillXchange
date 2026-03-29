const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const Message = require("./models/Message");

const path = require("path");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const skillRoutes = require("./routes/skillRoutes");
const searchRoutes = require("./routes/searchRoutes");
const matchRoutes = require("./routes/matchRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const groupRoutes = require("./routes/groupRoutes");
const Session = require("./models/Session");
const Group = require("./models/Group");
const Notification = require("./models/Notification");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL
].filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => res.send("API working!"));

app.get("/api/test", (req, res) => {
  res.json({ message: "Frontend and backend connected successfully" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", matchRoutes); 
app.use("/api/requests", requestRoutes); 
app.use("/api/notifications", notificationRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api/feedback", feedbackRoutes); 
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", searchRoutes); 

// Socket.io logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userSockets = io.userSockets || new Map();
  io.userSockets = userSockets;

  socket.on("register", (data) => {
    const { userId } = data || {};
    if (userId) {
      socket.userId = userId;
      userSockets.set(String(userId), socket.id);
    }
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const { requestId, groupId, isGroupMessage, senderId, receiverId, text, fileUrl, fileName, fileType } = data;
    
    try {
      const messageData = {
        senderId,
        text,
        fileUrl,
        fileName,
        fileType
      };

      if (isGroupMessage && groupId) {
        messageData.groupId = groupId;
        messageData.isGroupMessage = true;
      } else if (requestId) {
        messageData.requestId = requestId;
        messageData.receiverId = receiverId;
      }

      const newMessage = new Message(messageData);
      await newMessage.save();
      
      const roomId = isGroupMessage ? groupId : requestId;
      
      // Emit to everyone in the room
      io.to(roomId).emit("receive_message", newMessage);

      // Handle notifications
      if (isGroupMessage) {
        // Group message notification logic
        // For groups, we might want to notify all members except sender
        const group = await require("./models/Group").findById(groupId);
        if (group) {
          group.members.forEach(memberId => {
            if (memberId.toString() !== senderId.toString()) {
              const recvSocket = userSockets.get(String(memberId));
              if (recvSocket) {
                io.to(recvSocket).emit("message_notification", { groupId, message: newMessage });
              }
            }
          });
        }
      } else {
        // 1-on-1 message notification logic
        const recvSocket = userSockets.get(String(receiverId));
        const sndSocket = userSockets.get(String(senderId));
        if (recvSocket) {
          io.to(recvSocket).emit("message_notification", { requestId, message: newMessage });
        }
        if (sndSocket) {
          io.to(sndSocket).emit("message_notification", { requestId, message: newMessage });
        }
      }
    } catch (err) {
      console.error("Socket error:", err);
    }
  });

  // Call features removed
  socket.on("delete_message", (data) => {
    const { requestId, messageId } = data || {};
    if (!requestId || !messageId) return;
    io.to(requestId).emit("message_deleted", { messageId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    if (socket.userId) {
      userSockets.delete(String(socket.userId));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Session Start Notification Logic (Checks every minute)
  setInterval(async () => {
    try {
      const now = new Date();
      const currentDay = now.toISOString().split('T')[0];
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTimeSlot = `${currentHour}:${currentMinute}`;

      // Find active sessions that have a slot matching current time
      const activeSessions = await Session.find({ status: "active" });
      
      for (const session of activeSessions) {
        // Check if today is one of the scheduled days
        const todaySchedule = session.schedule.find(s => 
          s.date.toISOString().split('T')[0] === currentDay && 
          s.timeSlot === currentTimeSlot &&
          s.status === "upcoming"
        );

        if (todaySchedule) {
          // Notify both users
          for (const userId of session.users) {
            // Check if notification already sent for this specific slot to prevent duplicates
            const existing = await Notification.findOne({
              userId,
              type: "session_start",
              relatedId: session._id,
              createdAt: { $gte: new Date(now.getTime() - 60000) } // Sent in the last minute
            });

            if (!existing) {
              const notification = await Notification.create({
                userId,
                type: "session_start",
                message: `Your session is starting now! Join here: ${session.meetLink}`,
                relatedId: session._id
              });

              // Real-time emit
              const userSockets = io.userSockets || new Map();
              const targetSocket = userSockets.get(String(userId));
              if (targetSocket) {
                io.to(targetSocket).emit("notification", notification);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("SESSION NOTIFICATION CRON ERROR:", err);
    }
  }, 60000); // 1 minute interval
});
