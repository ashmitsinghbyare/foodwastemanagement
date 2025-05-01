const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receiver',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'fa-bell'  // Default icon for notifications, can be customized per notification type
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false  // Track if the notification has been read or not
  },
  type: {
    type: String,
    enum: ['info', 'alert', 'success', 'warning'],  // Optional: notification type (can be used to style them)
    default: 'info'
  },
  expiresAt: {
    type: Date,  // Optional: when the notification should expire and be removed
    default: null
  }
});

// Optional: Index for quicker queries on read/unread status or expiry
notificationSchema.index({ receiverId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
