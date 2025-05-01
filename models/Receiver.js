const mongoose = require('mongoose');
const validator = require('validator');

const receiverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  organizationName: {
    type: String,
    required: false,  // Made optional
  },
  contactEmail: {
    type: String,
    required: false,  // Made optional
    validate: {
      validator: function(value) {
        // Validate if email is provided and is valid
        return !value || validator.isEmail(value);
      },
      message: 'Please provide a valid email address',
    }
  },
  phone: {
    type: String,
    required: false,  // Made optional
    validate: {
      validator: function(value) {
        // Validate phone format, assuming international format
        return !value || validator.isMobilePhone(value, 'any', { strictMode: false });
      },
      message: 'Please provide a valid phone number',
    }
  },
  profileImage: {
    type: String,  // Will store the image path
    required: false,  // Made optional
    validate: {
      validator: function(value) {
        // Validate if it's a valid URL (assuming image URL)
        return !value || validator.isURL(value);
      },
      message: 'Please provide a valid URL for the profile image',
    }
  },
});

module.exports = mongoose.model('Receiver', receiverSchema);
