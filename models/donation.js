const mongoose = require('mongoose');
const { Schema } = mongoose;

const donationSchema = new Schema({
  foodname: { type: String },
  meal: { type: String },
  category: { type: String },
  quantity: { type: String },
  quantityNumeric: {
    type: Number,
    min: [0, 'Quantity must be a positive number.'],
  },
  amount: { type: Number },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Scheduled'], 
    default: 'Pending' 
  },
  name: { type: String, required: true },
  phoneno: { type: String },
  phone: { type: String },
  district: { type: String },
  location: { type: String },
  address: { type: String },
  pincode: { type: Number, required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupTime: {
    type: Date,
    validate: {
      validator: function(value) {
        return value && value > Date.now();  // Ensure pickup time is in the future
      },
      message: 'Pickup time must be in the future.',
    },
  },
  createdAt: { type: Date, default: Date.now },
  expirationDate: {
    type: Date,
    required: function() { return this.category === 'cooked-food' || this.category === 'raw-food'; }
  },
});

donationSchema.index({ status: 1, donorId: 1, pickupTime: 1 }); // Example index for performance

module.exports = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
