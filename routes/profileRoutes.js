const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAuthenticated = require('../middlewares/isAuthenticated');
const upload = require('../middlewares/multer'); // use your multer config



// Profile Page Route (Admin Profile)
router.get('/admin/profile', async (req, res) => {
  try {
    // Ensure that the user is logged in
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session ID exists
    }

    const user = await User.findById(req.session.userId); // Use session ID to find user
    if (!user) return res.status(404).send('User not found');

    res.render('profil', { user, hideNavbar: true, noFooter: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Edit Profile Page
router.get('/edit-profile', async (req, res) => {
  try {
    // Ensure that the user is logged in
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session ID exists
    }

    const user = await User.findById(req.session.userId); // Use session ID to find user
    if (!user) return res.status(404).send('User not found');

    res.render('editProfile', { user, hideNavbar: false, noFooter: false });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// Submit Profile Edits
router.post('/edit-profile', upload, async (req, res) => {
  const { firstName, lastName, gender } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Ensure that the user is logged in
    if (!req.session.userId) {
      return res.redirect('/login'); // Redirect to login if no session ID exists
    }

    // Use session ID to update user profile data
    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId, // Use session ID instead of req.user._id
      { 
        firstName, 
        lastName, 
        gender, 
        profileImage: profileImage || (req.session.user && req.session.user.profileImage)  // Use existing image if no new one
      },
      { new: true } // Return the updated document
    );

    // If no user is found or updated
    if (!updatedUser) {
      console.error('User not found or could not be updated');
      return res.status(404).send('User not found');
    }

    // Update the session data with the new user details
    req.session.user = {
      id: updatedUser._id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage || '/uploads/default-avatar.jpg',
    };

    // Save the updated session data
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session update error');
      }

      // Redirect back to the profile page after updating
      res.redirect('/profile');
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile');
  }
});

module.exports = router;
