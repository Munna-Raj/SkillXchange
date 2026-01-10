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
  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model("User", userSchema);
