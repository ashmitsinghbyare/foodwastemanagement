/*const express = require('express');
const router = express.Router();
const User = require('../models/User');

const isAuthenticated = require('../middlewares/isAuthenticated');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

// Profile Page Route (Donor Profile)
router.get('/dprofile', async (req, res) => {
  try {
    // Ensure that the user is logged in
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session ID exists
    }

    const user = await User.findById(req.session.userId); // Use session ID to find user
    if (!user) return res.status(404).send('User not found');

    // Ensure user is a donor before rendering
    if (user.role !== 'donor') {
      return res.status(403).send('Access denied. You must be a donor.');
    }

    // Render profile page for donor users
    res.render('Dprofile', { 
      user, 
      hideNavbar: true, 
      noFooter: true 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit Profile Page (Donor)
router.get('/deditprofile', async (req, res) => {
  try {
    // Ensure that the user is logged in
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session ID exists
    }

    const user = await User.findById(req.session.userId); // Use session ID to find user
    if (!user) return res.status(404).send('User not found');

    // Render edit profile page for the logged-in donor
    res.render('deditProfile', { 
      user, 
      hideNavbar: true, 
      noFooter: true 
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// Submit Profile Edits (Donor)
router.post('/deditprofile', upload.single('profileImage'), async (req, res) => {
  const { firstName, lastName, gender } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session ID exists
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId, // Use session ID instead of req.user._id
      { 
        firstName, 
        lastName, 
        gender, 
        profileImage: profileImage || (req.session.user && req.session.user.profileImage)  
      },
      { new: true } 
    );

    if (!updatedUser) {
      console.error('User not found or could not be updated');
      return res.status(404).send('User not found');
    }

    // Update session with new user information
    req.session.user = {
      id: updatedUser._id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage || '/uploads/default-avatar.jpg',
    };

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session update error');
      }

      res.redirect('/Dprofile');
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile');
  }
});*/

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middlewares/isAuthenticated');
const multer = require('multer');
const path = require('path');

// Define multer storage for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Profile Page Route (Donor Profile)
router.get('/dprofile',  async (req, res) => {
  try {
    // Ensure the logged-in user is a donor
    if (req.user.role !== 'donor') {
      return res.status(403).send('Access denied. You must be a donor.');
    }

    // Render profile page for donor users
    res.render('Dprofile', {
      user: req.user,
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit Profile Page Route (Donor)
router.get('/deditprofile', async (req, res) => {
  try {
    // Render edit profile page for the logged-in donor
    res.render('deditProfile', {
      user: req.user,
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// Submit Profile Edits (Donor)
router.post('/deditprofile',  upload.single('profileImage'), async (req, res) => {
  const { firstName, lastName, gender } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : req.user.profileImage;  // Use existing image if no file uploaded

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId, // Use session ID instead of req.user._id
      {
        firstName,
        lastName,
        gender,
        profileImage
      },
      { new: true }
    );

    if (!updatedUser) {
      console.error('User not found or could not be updated');
      return res.status(404).send('User not found');
    }

    // Update session with new user information
    req.session.user = updatedUser;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session update error');
      }

      res.redirect('/dprofile');
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile');
  }
});

module.exports = router;



