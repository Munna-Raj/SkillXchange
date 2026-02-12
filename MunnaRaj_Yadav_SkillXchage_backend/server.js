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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "http://localhost:5173" }));
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
app.use("/api", searchRoutes); 

// Socket.io logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

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
    } catch (err) {
      console.error("Socket error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
