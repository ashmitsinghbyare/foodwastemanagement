const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupTime: {
    type: Date
  },
  pickupConfirmed: {
    type: Boolean,
    default: false
  },
  donorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  receiverRating: {
    type: Number,
    min: 1,
    max: 5
  },
  donorFeedback: {
    type: String
  },
  receiverFeedback: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a receiver can only make one request per food item
// NOTE: The existing database might have a receiver_1_donation_1 index - we're updating to food_1_receiver_1
RequestSchema.index({ food: 1, receiver: 1 }, { unique: true, name: 'food_receiver_unique' });

module.exports = mongoose.model('Request', RequestSchema);
