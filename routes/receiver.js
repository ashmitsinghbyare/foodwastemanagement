const express = require('express');
const router = express.Router();
const receiverController = require('../controllers/receiverController');
const { ensureAuthenticated, ensureReceiver } = require('../middleware/auth');

// Receiver dashboard
router.get('/dashboard', ensureAuthenticated, ensureReceiver, receiverController.getDashboard);

// Browse available food listings
router.get('/browse', ensureAuthenticated, ensureReceiver, receiverController.browseFoods);

// Search food listings
router.get('/search', ensureAuthenticated, ensureReceiver, receiverController.searchFoods);

// View food listing details
router.get('/foods/:id', ensureAuthenticated, receiverController.getFoodDetails);

// Submit request for food
router.post('/foods/:id/request', ensureAuthenticated, ensureReceiver, receiverController.requestFood);

// My requests
router.get('/requests', ensureAuthenticated, ensureReceiver, receiverController.getMyRequests);

// View single request
router.get('/requests/:id', ensureAuthenticated, ensureReceiver, receiverController.getRequest);

// Cancel request
router.put('/requests/:id/cancel', ensureAuthenticated, ensureReceiver, receiverController.cancelRequest);

// Confirm pickup
router.put('/requests/:id/confirm-pickup', ensureAuthenticated, ensureReceiver, receiverController.confirmPickup);

// Leave feedback for donor
router.post('/requests/:id/feedback', ensureAuthenticated, ensureReceiver, receiverController.leaveFeedback);

// Get notifications
router.get('/notifications', ensureAuthenticated, ensureReceiver, receiverController.getNotifications);

// Mark notification as read
router.put('/notifications/:id/read', ensureAuthenticated, ensureReceiver, receiverController.markNotificationRead);

module.exports = router;
