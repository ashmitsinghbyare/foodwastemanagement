const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(value) {
        return validator.isEmail(value);  // Use validator's isEmail method to check if it's a valid email
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'receiver', 'donor'],
    
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  profileImage: { 
    type: String,
    default: '/uploads/default.png'
  },
  pincode: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return validator.isPostalCode(value, 'any'); // Validate if it's a valid postal code
      },
      message: 'Please provide a valid pincode'
    }
  },
  resetToken: String,
  resetTokenExpiry: Date
});

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password check method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
