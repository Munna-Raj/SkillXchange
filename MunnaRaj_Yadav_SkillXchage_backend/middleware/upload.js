const multer = require("multer");
const path = require("path");

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const prefix = file.mimetype.startsWith("image/") ? "chat-img-" : "chat-doc-";
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and common documents
  const allowedMimetypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain"
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported. Please upload an image or a document."), false);
  }
};

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
