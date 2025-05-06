const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { ensureAuthenticated } = require('../middleware/auth');
const { profileUpload } = require('../config/multer');

// View profile
router.get('/', ensureAuthenticated, profileController.getProfile);

// Account settings page
router.get('/settings', ensureAuthenticated, profileController.getSettings);

// Edit profile page
router.get('/edit', ensureAuthenticated, profileController.getEditProfile);

// Update profile
router.post('/edit', ensureAuthenticated, (req, res, next) => {
  profileUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', `Upload error: ${err.message}`);
      return res.redirect('/profile/edit');
    }
    next();
  });
}, profileController.updateProfile);

// Change password page
router.get('/change-password', ensureAuthenticated, profileController.getChangePassword);

// Process change password
router.post('/change-password', ensureAuthenticated, profileController.changePassword);

// Resend verification email
router.post('/resend-verification', ensureAuthenticated, profileController.resendVerificationEmail);

// Delete account
router.delete('/delete', ensureAuthenticated, profileController.deleteAccount);

module.exports = router;
