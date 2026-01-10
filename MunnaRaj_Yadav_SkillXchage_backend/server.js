const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

connectDB();

app.get("/", (req, res) => res.send("API working!"));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
