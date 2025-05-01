const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['Donor', 'Receiver', 'Guest'],
    default: 'Guest'
  },
  rating: {
    type: Number,
    required: true,  // assuming the rating is required
    min: 1,          // optional: ensuring the rating is between 1 and 5
    max: 5,          // optional: limiting rating to a range (1-5)
  },
  // No need to add date explicitly, as "timestamps: true" will automatically add createdAt and updatedAt
}, { timestamps: true });

// Check if the model is already compiled, if not then define it
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
