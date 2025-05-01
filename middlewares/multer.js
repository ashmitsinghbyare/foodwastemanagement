// In routes/profileRoutes.js or a separate multer.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');  // The folder where images will be stored
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Get file extension
    cb(null, Date.now() + ext);  // Use current timestamp for unique filename
  }
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).single('profileImage');




module.exports = upload;
