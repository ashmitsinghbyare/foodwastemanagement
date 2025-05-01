
const express = require('express');
const restrictDonorAccess = require('../middlewares/restrictDonorAccess');
const router = express.Router();

// Middleware to ensure user is a donor


// Donor Dashboard
router.get('/dashboard', restrictDonorAccess, (req, res) => {
  res.render('donor-dashboard',
     { user: req.user  , title: 'Donor Dashboard', hideNavbar: true, noFooter: true });
});


module.exports = router;
