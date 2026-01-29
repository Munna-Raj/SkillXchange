const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ""
  },
  contactNumber: {
    type: String,
    default: ""
  },
  skillsToTeach: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    description: { type: String }
  }],
  skillsToLearn: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    description: { type: String }
  }],
  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model("User", userSchema);
