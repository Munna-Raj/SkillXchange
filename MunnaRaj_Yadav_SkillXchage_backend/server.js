const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
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
  "http://localhost:5175",
  "http://localhost:3000",
  "http://localhost:5176",
  "http://localhost:5177",
  "https://skillxchange-1.netlify.app",
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

// Serve static files from uploads folder with CORS enabled
app.use("/uploads", cors(), express.static(path.join(__dirname, "uploads")));

connectDB();

// Verify Cloudinary Environment Variables and Connectivity on Startup
console.log("--- SYSTEM CONFIG CHECK ---");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "PRESENT" : "MISSING");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "PRESENT" : "MISSING");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "PRESENT" : "MISSING");

if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  cloudinary.api.ping()
    .then(result => console.log("CLOUDINARY: Connection Successful", result))
    .catch(err => console.error("CLOUDINARY: Connection Failed - Check your Secret/Key!", err.message));
}

console.log("BASE_URL:", process.env.BASE_URL);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("---------------------------");

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

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ msg: "Route not found" });
});

// Global Error Handler to catch Multer and other middleware errors
app.use((err, req, res, next) => {
  const errorDetails = {
    message: err.message || "No message",
    name: err.name || "Error",
    code: err.code,
    status: err.status,
    path: req.path,
    method: req.method
  };

  // Only log stack in development
  if (process.env.NODE_ENV !== 'production') {
    errorDetails.stack = err.stack;
  }

  console.error("CRITICAL GLOBAL ERROR:", errorDetails);
  
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError || err.name === "MulterError" || err.code?.startsWith("LIMIT_")) {
    return res.status(400).json({
      msg: "File upload error",
      error: err.message,
      code: err.code || "UPLOAD_ERROR"
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    msg: "Internal Server Error",
    error: process.env.NODE_ENV === 'production' ? "An unexpected error occurred" : err.message,
    type: err.name || "Error"
  });
});

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
    const { requestId, groupId, isGroupMessage, senderId, receiverId, text, fileUrl, fileName, fileType, fromUpload } = data;
    
    try {
      let newMessage;
      
      if (fromUpload && data._id) {
        // If it's already saved via API (fromUpload: true), just use the data
        newMessage = data;
      } else {
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

        newMessage = new Message(messageData);
        await newMessage.save();
      }
      
      const roomId = isGroupMessage ? groupId : requestId;
      
      // Broadcast to EVERYONE in the room including the sender.
      // The duplicate check in the frontend will handle any double-rendering.
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
