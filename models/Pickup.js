const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References User model for donor
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receiver',  // References Receiver model
    required: true
  },
  foodType: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,  // Expiry date for perishable food
    required: function() {
      return this.foodType === 'raw-food' || this.foodType === 'cooked-food';  // Expiry date required only for certain food types
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  pickupTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Pickup||mongoose.model('Pickup', pickupSchema);
