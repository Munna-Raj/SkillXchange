const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const Message = require("./models/Message");

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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

connectDB();

app.get("/", (req, res) => res.send("API working!"));

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

  socket.on("join_room", (requestId) => {
    socket.join(requestId);
    console.log(`User joined room: ${requestId}`);
  });

  socket.on("send_message", async (data) => {
    const { requestId, senderId, receiverId, text } = data;
    
    try {
      const newMessage = new Message({
        requestId,
        senderId,
        receiverId,
        text
      });
      await newMessage.save();
      
      // Emit to everyone in the room
      io.to(requestId).emit("receive_message", newMessage);

      const userSockets = io.userSockets || new Map();
      const recvSocket = userSockets.get(String(receiverId));
      const sndSocket = userSockets.get(String(senderId));
      if (recvSocket) {
        io.to(recvSocket).emit("message_notification", { requestId, message: newMessage });
      }
      if (sndSocket) {
        io.to(sndSocket).emit("message_notification", { requestId, message: newMessage });
      }
    } catch (err) {
      console.error("Socket error:", err);
    }
  });

  // Call features removed

  socket.on("disconnect", () => {
    console.log("User disconnected");
    if (socket.userId) {
      userSockets.delete(String(socket.userId));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
