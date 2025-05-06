const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Configure SendGrid for email delivery
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found. Email functionality will use fallback transport.');
}

// Fallback to nodemailer if SendGrid fails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'noreply@foodwastemanagement.com',
      pass: process.env.EMAIL_PASS || ''
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Helper function to send email with fallback
async function sendEmail(mailOptions) {
  try {
    // Try SendGrid first
    if (SENDGRID_API_KEY) {
      await sgMail.send(mailOptions);
      console.log('Email sent via SendGrid');
      return true;
    } else {
      throw new Error('SendGrid API key not configured');
    }
  } catch (error) {
    console.warn('SendGrid send failed:', error.message);
    console.log('Trying nodemailer fallback...');
    
    try {
      // Fallback to nodemailer
      const transporter = createTransporter();
      await transporter.sendMail({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html
      });
      console.log('Email sent via nodemailer fallback');
      return true;
    } catch (fallbackError) {
      console.error('Nodemailer fallback failed:', fallbackError);
      return false;
    }
  }
}

// Get user profile
exports.getProfile = (req, res) => {
  // Render different profile templates based on user role
  const role = req.user.role;
  let template = 'profile/index';
  
  // If user is admin, render admin profile
  if (role === 'admin') {
    template = 'profile/admin-profile';
  }
  
  res.render(template, {
    title: 'My Profile',
    user: req.user
  });
};

// Get account settings page
exports.getSettings = (req, res) => {
  res.render('profile/settings', {
    title: 'Account Settings',
    user: req.user
  });
};

// Get edit profile page
exports.getEditProfile = (req, res) => {
  res.render('profile/edit', {
    title: 'Edit Profile',
    user: req.user
  });
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    // Get form data
    const {
      name,
      phone,
      organization,
      bio,
      street,
      city,
      state,
      postalCode,
      country
    } = req.body;
    
    // Validate name field
    if (!name || name.trim() === '') {
      req.flash('error_msg', 'Name is required');
      return res.redirect('/profile/edit');
    }
    
    // Get user from database
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/profile/edit');
    }
    
    // Update user basic info
    user.name = name.trim();
    user.phone = phone || '';
    user.organization = organization || '';
    user.bio = bio || '';
    
    // Update address information
    user.address = {
      street: street || '',
      city: city || '',
      state: state || '',
      postalCode: postalCode || '',
      country: country || ''
    };
    
    // Handle profile image upload
    if (req.file) {
      console.log('Processing file upload:', req.file.filename);
      
      // Delete old profile image (if not default)
      if (user.profileImage && user.profileImage !== 'default-profile.png') {
        try {
          const oldImagePath = path.join(__dirname, '../public/uploads/profiles', user.profileImage);
          // Check if file exists before trying to delete
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath); // Use sync version for simplicity
          }
        } catch (err) {
          console.error(`Failed to delete old profile image: ${err}`);
          // Continue with the update even if image deletion fails
        }
      }
      
      // Set new profile image
      user.profileImage = req.file.filename;
    }
    
    // Save the user
    await user.save();
    
    // Set success message and redirect
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (err) {
    console.error('Profile update error:', err);
    req.flash('error_msg', `Failed to update profile: ${err.message}`);
    res.redirect('/profile/edit');
  }
};

// Get change password page
exports.getChangePassword = (req, res) => {
  res.render('profile/change-password', {
    title: 'Change Password',
    user: req.user
  });
};

// Process change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'New passwords do not match');
      return res.redirect('/profile/change-password');
    }
    
    // Check password length
    if (newPassword.length < 6) {
      req.flash('error_msg', 'New password must be at least 6 characters');
      return res.redirect('/profile/change-password');
    }
    
    // Get user
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      req.flash('error_msg', 'Current password is incorrect');
      return res.redirect('/profile/change-password');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    req.flash('success_msg', 'Password changed successfully');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to change password');
    res.redirect('/profile/change-password');
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Get user
    const user = await User.findById(req.user._id);
    
    // Update token
    user.resetPasswordToken = verificationToken;
    user.resetPasswordExpires = Date.now() + 86400000; // 24 hours
    
    await user.save();
    
    // Send verification email
    const verificationUrl = `http://${req.get('host')}/auth/verify/${verificationToken}`;
    
    const mailOptions = {
      from: 'noreply@foodwastemanagement.com',
      to: user.email,
      subject: 'Verify Your Account - Food Waste Management System',
      html: `
        <h1>Account Verification</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    };
    
    const emailSent = await sendEmail(mailOptions);
    
    if (emailSent) {
      req.flash('success_msg', 'Verification email sent! Please check your inbox.');
    } else {
      req.flash('warning_msg', 'Could not send email. Please try again later or contact support.');
    }
    
    res.redirect('/profile/settings');
  } catch (err) {
    console.error('Verification email error:', err);
    req.flash('error_msg', 'Failed to send verification email: ' + err.message);
    res.redirect('/profile/settings');
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    // In a real application, you would handle related data deletion
    // For this example, we'll just mark the user as inactive
    
    const user = await User.findById(req.user._id);
    
    // Delete profile image
    if (user.profileImage && user.profileImage !== 'default-profile.png') {
      const imagePath = path.join(__dirname, '../public/uploads/profiles', user.profileImage);
      fs.unlink(imagePath, err => {
        if (err) console.error(`Failed to delete profile image: ${err}`);
      });
    }
    
    // Delete user (in a real app, consider soft deletion)
    await user.deleteOne();
    
    // Log out the user
    req.logout(function(err) {
      if (err) {
        console.error(err);
        return next(err);
      }
      req.flash('success_msg', 'Your account has been deleted');
      res.redirect('/');
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete account');
    res.redirect('/profile');
  }
};
