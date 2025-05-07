const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { ensureAuthenticated, ensureDonor } = require('../middleware/auth');
const { foodImageUpload } = require('../config/multer');

// Donor dashboard
router.get('/dashboard', ensureAuthenticated, ensureDonor, donorController.getDashboard);

// Food listings management
router.get('/foods', ensureAuthenticated, ensureDonor, donorController.getFoodListings);

// Create new food listing page
router.get('/foods/new', ensureAuthenticated, ensureDonor, donorController.getCreateFood);

// Process create food form
router.post('/foods', ensureAuthenticated, ensureDonor, (req, res, next) => {
  foodImageUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', `Upload error: ${err.message}`);
      return res.redirect('/donor/foods/new');
    }
    next();
  });
}, donorController.postCreateFood);

// Edit food listing page
router.get('/foods/:id/edit', ensureAuthenticated, ensureDonor, donorController.getEditFood);

// Update food listing
router.put('/foods/:id', ensureAuthenticated, ensureDonor, (req, res, next) => {
  foodImageUpload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', `Upload error: ${err.message}`);
      return res.redirect(`/donor/foods/${req.params.id}/edit`);
    }
    next();
  });
}, donorController.updateFood);

// Delete food listing
router.delete('/foods/:id', ensureAuthenticated, ensureDonor, donorController.deleteFood);

// View food requests
router.get('/requests', ensureAuthenticated, ensureDonor, donorController.getRequests);

// View single request
router.get('/requests/:id', ensureAuthenticated, ensureDonor, donorController.getRequest);

// Approve request
router.put('/requests/:id/approve', ensureAuthenticated, ensureDonor, donorController.approveRequest);

// Reject request
router.put('/requests/:id/reject', ensureAuthenticated, ensureDonor, donorController.rejectRequest);

// Mark request as completed
router.put('/requests/:id/complete', ensureAuthenticated, ensureDonor, donorController.completeRequest);
router.post('/requests/:id/complete', ensureAuthenticated, ensureDonor, donorController.completeRequest);

// Leave feedback for receiver
router.post('/requests/:id/feedback', ensureAuthenticated, ensureDonor, donorController.leaveFeedback);

// Get notifications
router.get('/notifications', ensureAuthenticated, ensureDonor, donorController.getNotifications);

// Mark notification as read
router.put('/notifications/:id/read', ensureAuthenticated, ensureDonor, donorController.markNotificationRead);

module.exports = router;
