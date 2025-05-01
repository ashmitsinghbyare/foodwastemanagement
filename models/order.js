const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  foodname: {
    type: String,
    required: true  // Make sure the food name is always provided
  },
  meal: {
    type: String,
    enum: ['veg', 'non-veg'],  // Restrict values for meal type
    required: true
  },
  category: {
    type: String,
    enum: ['raw-food', 'cooked-food', 'packed-food'],  // Ensure that category is one of these values
    required: true
  },
  quantity: {
    type: Number,  // Change to Number for easier operations
    required: true
  },
  name: {
    type: String,
    required: true  // Make sure the name is always provided
  },
  phoneno: {
    type: String,
    required: false,  // Optional field, you can add validation if needed
    match: /^[0-9]{10}$/  // Optional validation for 10-digit phone number
  },
  district: {
    type: String,
    required: false  // Optional, add more fields if you need more specific validation
  },
  address: {
    type: String,
    required: false  // Optional, but consider making it required if critical
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
