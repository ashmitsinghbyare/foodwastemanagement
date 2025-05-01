const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET view profile
router.get('/viewprofile',  async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('viewprofile', { user  ,hideNavbar: true, noFooter: true });
});

// POST update profile
router.post('/viewprofile',  async (req, res) => {
  const { firstName, lastName, email, gender, address, pincode } = req.body;
  await User.findByIdAndUpdate(req.session.userId, {
    firstName,lastName, email, gender, address, pincode
  });
  res.redirect('/account/viewprofile');
});


// View settings page
router.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('account-settings', { user: req.session.user , hideNavbar: true, noFooter: true });
});

// Update user info
router.post('/update', (req, res) => {
  const { name, email, organization, address, phone } = req.body;
  const user = req.session.user;

  user.name = name;
  user.email = email;
  if (user.role !== 'admin') {
    user.organization = organization;
    user.address = address;
    user.phone = phone;
  }

  // Save to DB here in real app
  req.session.user = user;
  res.redirect('/account');
});

// Change password (placeholder logic)
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  // Verify currentPassword and update to newPassword
  // Implement DB logic

  res.send('Password changed successfully');
});

// Delete account (placeholder logic)
router.post('/delete', (req, res) => {
  const userId = req.session.user.id;

  // Delete user from DB here
  req.session.destroy();
  res.send('Account deleted successfully');
});

module.exports = router;
