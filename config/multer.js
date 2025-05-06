const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const profileImagesDir = path.join(uploadsDir, 'profiles');
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

const foodImagesDir = path.join(uploadsDir, 'foods');
if (!fs.existsSync(foodImagesDir)) {
  fs.mkdirSync(foodImagesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload directory based on file type
    let uploadPath = uploadsDir;
    
    if (req.baseUrl.includes('profile')) {
      uploadPath = profileImagesDir;
    } else if (req.baseUrl.includes('donor') || req.baseUrl.includes('food')) {
      uploadPath = foodImagesDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow only image files
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instances
const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}).single('profileImage');

const foodImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}).array('foodImages', 5); // Maximum of 5 images per food listing

module.exports = {
  profileUpload,
  foodImageUpload
};
