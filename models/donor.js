const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const donorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email address.'], // Email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforce minimum password length
  },
  role: {
    type: String,
    required: true,
    enum: ['donor', 'receiver', 'admin'], // Define valid roles
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'], // Gender options
  },
  profileImage: {
    type: String, // URL to profile image
  },
  address: {
    type: String,
    required: true, // Assuming address is always required for donors and receivers
  },
  receiverType: {
    type: String,
    enum: ['individual', 'organization'], // Define if the receiver is an individual or organization
  },
  organizationName: {
    type: String,
    required: function() {
      return this.receiverType === 'organization'; // Only required if the receiver is an organization
    },
  },
}, { timestamps: true });

// Pre-save hook to hash password
donorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare hashed passwords during login
donorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Donor', donorSchema);
