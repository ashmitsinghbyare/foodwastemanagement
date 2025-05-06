const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Admin dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, adminController.getDashboard);

// Users management
router.get('/users', ensureAuthenticated, ensureAdmin, adminController.getUsers);

// View user details
router.get('/users/:id', ensureAuthenticated, ensureAdmin, adminController.getUser);

// Update user
router.put('/users/:id', ensureAuthenticated, ensureAdmin, adminController.updateUser);

// Delete user
router.delete('/users/:id', ensureAuthenticated, ensureAdmin, adminController.deleteUser);

// Food listings management
router.get('/foods', ensureAuthenticated, ensureAdmin, adminController.getFoods);

// View food details
router.get('/foods/:id', ensureAuthenticated, ensureAdmin, adminController.getFood);

// Approve/reject food listing
router.put('/foods/:id/moderate', ensureAuthenticated, ensureAdmin, adminController.moderateFood);

// Delete food listing
router.delete('/foods/:id', ensureAuthenticated, ensureAdmin, adminController.deleteFood);

// Requests management
router.get('/requests', ensureAuthenticated, ensureAdmin, adminController.getRequests);

// View request details
router.get('/requests/:id', ensureAuthenticated, ensureAdmin, adminController.getRequest);

// Moderate request
router.put('/requests/:id/moderate', ensureAuthenticated, ensureAdmin, adminController.moderateRequest);

// System statistics
router.get('/stats', ensureAuthenticated, ensureAdmin, adminController.getStats);

// System logs
router.get('/logs', ensureAuthenticated, ensureAdmin, adminController.getLogs);

// Send system notification
router.post('/notify', ensureAuthenticated, ensureAdmin, adminController.sendNotification);

module.exports = router;
