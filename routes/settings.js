// settingsRoute.js (or routes/settings.js)
const express = require('express');
const router = express.Router();

// Render Settings Page
router.get('/settings', (req, res) => {
  res.render('settings', {
    hideNavbar: false,  // Navbar visible on settings page
    noFooter: false,    // Footer visible on settings page
  });
});

// Post route for handling form submission
router.post('/settings', (req, res) => {
  // Get data from the form submission
  const { role, systemName, timezone, maxHoldTime, adminNotifications, requireApproval,
          businessType, pickupTime, foodCategories, donorAddress, donorPhone, donorNotify,
          dailyCapacity, hours, acceptedFoodTypes, pickupInstructions, storageCapacity, emergencyContact } = req.body;

  // Here you would save this data to a database or use it as needed
  // For now, we will just log the data to the console
  console.log('Settings submitted:', req.body);

  // Respond back to the client (you could render the settings page again or redirect somewhere else)
  res.render('settings', {
    hideNavbar: false,  // Keep navbar visible
    noFooter: false,    // Keep footer visible
    successMessage: 'Settings updated successfully!'  // Display success message
  });
});

module.exports = router;
