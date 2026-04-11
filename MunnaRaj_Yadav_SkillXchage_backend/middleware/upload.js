const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Save unique filename with original extension
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

// File filter to accept images and common docs
const fileFilter = (req, file, cb) => {
  const allowedExt = [
    ".jpeg", ".jpg", ".png", ".gif",
    ".pdf", ".doc", ".docx", ".txt", ".zip"
  ];
  const allowedMime = [
    "image/jpeg", "image/jpg", "image/png", "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip", "application/x-zip-compressed"
  ];
  const extname = allowedExt.includes(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
