const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Food = require('../models/Food');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

// Middleware to get unread notification count for authenticated users
async function getUnreadNotificationCount(req, res, next) {
  if (req.isAuthenticated()) {
    try {
      const notificationHelper = require('../utils/notificationHelper');
      const count = await notificationHelper.getUnreadCount(req.user._id);
      res.locals.unreadNotificationCount = count;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      res.locals.unreadNotificationCount = 0;
    }
  }
  next();
}

// Apply the middleware to all routes
router.use(getUnreadNotificationCount);

// Home page
router.get('/', async (req, res) => {
  try {
    // Get latest food listings for homepage
    const recentListings = await Food.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('donor', 'name');

    // Get testimonials for homepage
    const testimonials = await Feedback.find({ isTestimonial: true })
      .populate('user', 'name role profileImage')
      .sort({ createdAt: -1 })
      .limit(6);

    // Calculate impact statistics
    const totalFoods = await Food.countDocuments();
    const completedFoods = await Food.countDocuments({ status: 'completed' });
    const totalKgSaved = await Food.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $toInt: "$quantity" } } } }
    ]);
    
    // Calculate environmental impact (rough estimates)
    // Average CO2 per kg of food waste: 2.5 kg CO2 equivalent
    const kgSaved = totalKgSaved.length > 0 ? totalKgSaved[0].total : 0;
    const co2Saved = kgSaved * 2.5; // kg CO2 equivalent
    
    // Count unique donors and receivers who have participated
    const uniqueDonors = (await Food.distinct('donor')).length;
    const uniqueReceivers = (await Food.distinct('receiverId')).length;

    res.render('home', {
      title: 'Food Waste Management System',
      recentListings,
      testimonials,
      stats: {
        totalFoods,
        completedDonations: completedFoods,
        kgFoodSaved: kgSaved,
        co2Saved,
        uniqueDonors,
        uniqueReceivers
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while loading the homepage');
    res.render('home', {
      title: 'Food Waste Management System',
      recentListings: [],
      testimonials: [],
      stats: {
        totalFoods: 0,
        completedDonations: 0,
        kgFoodSaved: 0,
        co2Saved: 0,
        uniqueDonors: 0,
        uniqueReceivers: 0
      }
    });
  }
});

// About page
router.get('/about', async (req, res) => {
  try {
    // Calculate impact statistics
    const totalFoods = await Food.countDocuments();
    const completedFoods = await Food.countDocuments({ status: 'completed' });
    const totalKgSaved = await Food.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $toInt: "$quantity" } } } }
    ]);
    
    // Calculate environmental impact (rough estimates)
    // Average CO2 per kg of food waste: 2.5 kg CO2 equivalent
    const kgSaved = totalKgSaved.length > 0 ? totalKgSaved[0].total : 0;
    const co2Saved = kgSaved * 2.5; // kg CO2 equivalent
    
    // Count unique donors and receivers who have participated
    const uniqueDonors = (await Food.distinct('donor')).length;
    const uniqueReceivers = (await Food.distinct('receiverId')).length;
    
    res.render('about', {
      title: 'About Us',
      stats: {
        totalFoods,
        completedDonations: completedFoods,
        kgFoodSaved: kgSaved,
        co2Saved,
        uniqueDonors,
        uniqueReceivers
      }
    });
  } catch (err) {
    console.error(err);
    res.render('about', {
      title: 'About Us',
      stats: {
        totalFoods: 0,
        completedDonations: 0,
        kgFoodSaved: 0,
        co2Saved: 0,
        uniqueDonors: 0,
        uniqueReceivers: 0
      }
    });
  }
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us'
  });
});

// Dashboard - redirect based on user role
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  switch (req.user.role) {
    case 'donor':
      res.redirect('/donor/dashboard');
      break;
    case 'receiver':
      res.redirect('/receiver/dashboard');
      break;
    case 'admin':
      res.redirect('/admin/dashboard');
      break;
    default:
      res.redirect('/');
  }
});

module.exports = router;
