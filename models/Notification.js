const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['request_received', 'request_approved', 'request_rejected', 'food_listed', 'reminder', 'system', 'completion', 'pickup_confirmed', 'feedback'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Food', 'Request', 'User', 'Feedback']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  url: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
