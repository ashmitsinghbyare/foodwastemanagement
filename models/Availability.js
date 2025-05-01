// models/Availability.js
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  donorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  availableItems: { 
    type: Number, 
    default: 0 
  },  // Number of items available for donation
  nextPickup: { 
    type: Date, 
    required: false // Made optional, depending on your use case
  },    // Date and time of the next pickup
  status: { 
    type: String, 
    enum: ['Available', 'Unavailable'], 
    default: 'Available' 
  }, // Current availability status
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Availability', availabilitySchema);
