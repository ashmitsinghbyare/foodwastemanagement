const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    enum: ['servings', 'kg', 'lb', 'pieces', 'packages', 'boxes']
  },
  category: {
    type: String,
    required: true,
    enum: ['cooked food', 'raw food', 'packaged food', 'fruits', 'vegetables', 'bread', 'dairy', 'other']
  },
  expiryDate: {
    type: Date,
    required: true
  },
  images: [{
    type: String
  }],
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupDetails: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    instructions: { type: String },
    availability: [{ 
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      from: { type: String },
      to: { type: String }
    }]
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'completed', 'expired', 'cancelled'],
    default: 'available'
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
FoodSchema.index({ title: 'text', description: 'text', 'pickupDetails.address.city': 'text' });

// Virtual for checking if item is expired
FoodSchema.virtual('isExpired').get(function() {
  return new Date(this.expiryDate) < new Date();
});

// Middleware to automatically update status to expired if expiry date is past
FoodSchema.pre('find', function() {
  this.where({ expiryDate: { $gt: new Date() } }).or([{ status: { $ne: 'available' } }, { status: 'available' }]);
});

module.exports = mongoose.model('Food', FoodSchema);
