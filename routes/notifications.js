const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/auth');

// Helper function to get notification icon
const getNotificationIcon = (type) => {
  const icons = {
    'request_received': '<i class="fas fa-hand-holding-heart text-primary"></i>',
    'request_approved': '<i class="fas fa-check-circle text-success"></i>',
    'request_rejected': '<i class="fas fa-times-circle text-danger"></i>',
    'food_listed': '<i class="fas fa-utensils text-info"></i>',
    'reminder': '<i class="fas fa-clock text-warning"></i>',
    'system': '<i class="fas fa-cog text-secondary"></i>'
  };
  
  return icons[type] || '<i class="fas fa-bell text-secondary"></i>';
};

// Helper function to format date
const formatDate = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffMs = now - notificationDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return notificationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// View all notifications
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // Get user notifications sorted by date (newest first)
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });
    
    // Render with helper functions available in the template
    res.render('notifications', {
      title: 'Notifications',
      notifications,
      user: req.user,
      getNotificationIcon,
      formatDate
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error loading notifications');
    res.redirect('back');
  }
});

// Mark single notification as read
router.post('/mark-read/:id', ensureAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    // Check if notification exists and belongs to user
    if (!notification || notification.recipient.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Notification not found');
      return res.redirect('/notifications');
    }
    
    // Update notification
    notification.isRead = true;
    await notification.save();
    
    req.flash('success_msg', 'Notification marked as read');
    res.redirect('/notifications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating notification');
    res.redirect('/notifications');
  }
});

// Mark all notifications as read
router.post('/mark-all-read', ensureAuthenticated, async (req, res) => {
  try {
    const notificationHelper = require('../utils/notificationHelper');
    
    // Use the helper to mark all as read
    await notificationHelper.markAllAsRead(req.user._id);
    
    req.flash('success_msg', 'All notifications marked as read');
    res.redirect('/notifications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating notifications');
    res.redirect('/notifications');
  }
});

// Delete a notification
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    // Check if notification exists and belongs to user
    if (!notification || notification.recipient.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'Notification not found');
      return res.redirect('/notifications');
    }
    
    // Delete notification
    await notification.deleteOne();
    
    req.flash('success_msg', 'Notification deleted');
    res.redirect('/notifications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting notification');
    res.redirect('/notifications');
  }
});

// Update notification preferences
router.post('/preferences', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Update notification preferences
    user.notificationPreferences = {
      email_requests: req.body.email_requests === 'on',
      email_approvals: req.body.email_approvals === 'on',
      email_system: req.body.email_system === 'on',
      app_requests: req.body.app_requests === 'on',
      app_approvals: req.body.app_approvals === 'on',
      app_system: req.body.app_system === 'on'
    };
    
    await user.save();
    
    req.flash('success_msg', 'Notification preferences updated');
    res.redirect('/notifications');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating preferences');
    res.redirect('/notifications');
  }
});

module.exports = router;