const mongoose = require('mongoose');
const validator = require('validator');

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Please enter a valid email address'] // Email validation
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receiver',
    required: true
  }
,  
  subject: {
    type: String,
    required: false  // Optional subject field for categorizing or prioritizing messages
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Viewed', 'Replied'],
    default: 'New'  // Track the status of the message
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
