const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Configure SendGrid for email delivery
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found. Email functionality will not work.');
}

// Fallback to nodemailer if SendGrid fails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'noreplyfoodwastemanagement@gmail.com',
      pass: process.env.EMAIL_PASS || ''
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Get login page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    user: req.user
  });
};

// Get register page
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    user: req.user
  });
};

// Process login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
};

// Process registration
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, password2, role } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }

    // Check valid role
    const validRoles = ['donor', 'receiver' , 'admin'];
    if (!validRoles.includes(role)) {
      errors.push({ msg: 'Please select a valid role' });
    }

    if (errors.length > 0) {
      return res.render('auth/register', {
        title: 'Register',
        errors,
        name,
        email,
        role
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('auth/register', {
        title: 'Register',
        errors,
        name,
        email,
        role
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      resetPasswordToken: verificationToken,
      resetPasswordExpires: Date.now() + 86400000 // 24 hours
    });

    // Save user
    await newUser.save();

    // Send verification email
    const verificationUrl = `http://${req.headers.host}/auth/verify/${verificationToken}`;
    
    const msg = {
      from: 'noreply@foodwastemanagement.com',
      to: email,
      subject: 'Verify Your Account - Food Waste Management System',
      html: `
        <h1>Welcome to Food Waste Management System!</h1>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    try {
      if (SENDGRID_API_KEY) {
        try {
          await sgMail.send(msg);
          req.flash('success_msg', 'You are now registered! Please check your email to verify your account.');
        } catch (sgError) {
          console.error('SendGrid error, trying nodemailer fallback for registration:', sgError);
          // Fallback to nodemailer
          const transporter = createTransporter();
          await transporter.sendMail({
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            html: msg.html
          });
          req.flash('success_msg', 'You are now registered! Please check your email to verify your account.');
        }
      } else {
        // Try nodemailer if SendGrid key is not available
        try {
          const transporter = createTransporter();
          await transporter.sendMail({
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            html: msg.html
          });
          req.flash('success_msg', 'You are now registered! Please check your email to verify your account.');
        } catch (emailErr) {
          console.error('Unable to send verification email:', emailErr);
          req.flash('success_msg', 'You are now registered! However, we could not send a verification email.');
        }
      }
    } catch (err) {
      console.error('Error sending verification email:', err);
      req.flash('success_msg', 'You are now registered! However, we could not send a verification email.');
    }

    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
};

// Logout
exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
};

// Get forgot password page
exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password'
  });
};

// Process forgot password
exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('error_msg', 'No account with that email address exists');
      return res.redirect('/auth/forgot-password');
    }
    
    // Set reset token and expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Send reset email
    const resetUrl = `http://${req.headers.host}/auth/reset-password/${token}`;
    
    const msg = {
      from: 'noreply@foodwastemanagement.com',
      to: email,
      subject: 'Password Reset - Food Waste Management System',
      html: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this because you (or someone else) requested a password reset for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };
    
    try {
      if (SENDGRID_API_KEY) {
        try {
          await sgMail.send(msg);
          req.flash('success_msg', 'An email has been sent with further instructions');
        } catch (sgError) {
          console.error('SendGrid error, trying nodemailer fallback:', sgError);
          // Fallback to nodemailer
          const transporter = createTransporter();
          await transporter.sendMail({
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            html: msg.html
          });
          req.flash('success_msg', 'An email has been sent with further instructions');
        }
      } else {
        // Try nodemailer if SendGrid key is not available
        const transporter = createTransporter();
        await transporter.sendMail({
          from: msg.from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html
        });
        req.flash('success_msg', 'An email has been sent with further instructions');
      }
    } catch (err) {
      console.error('Failed to send email using all methods:', err);
      req.flash('error_msg', 'Failed to send reset email. Please try again later or contact support.');
    }
    
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while processing your request');
    res.redirect('/auth/forgot-password');
  }
};

// Get reset password page
exports.getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/auth/forgot-password');
    }
    
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while processing your request');
    res.redirect('/auth/forgot-password');
  }
};

// Process reset password
exports.postResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, password2 } = req.body;
    
    // Validate passwords
    if (password !== password2) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect(`/auth/reset-password/${token}`);
    }
    
    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters');
      return res.redirect(`/auth/reset-password/${token}`);
    }
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Password reset token is invalid or has expired');
      return res.redirect('/auth/forgot-password');
    }
    
    // Update password and clear token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    // Send confirmation email
    const msg = {
      from: 'noreply@foodwastemanagement.com',
      to: user.email,
      subject: 'Your password has been changed - Food Waste Management System',
      html: `
        <h1>Password Changed</h1>
        <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>
      `
    };
    
    try {
      if (SENDGRID_API_KEY) {
        try {
          await sgMail.send(msg);
        } catch (sgError) {
          console.error('SendGrid error, trying nodemailer fallback for confirmation:', sgError);
          // Fallback to nodemailer
          const transporter = createTransporter();
          await transporter.sendMail({
            from: msg.from,
            to: msg.to,
            subject: msg.subject,
            html: msg.html
          });
        }
      } else {
        // Try nodemailer if SendGrid key is not available
        const transporter = createTransporter();
        await transporter.sendMail({
          from: msg.from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html
        });
      }
    } catch (err) {
      console.error('Error sending password change confirmation email:', err);
      // Don't let this error affect the user experience
    }
    
    req.flash('success_msg', 'Your password has been updated! You can now log in with your new password.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred while processing your request');
    res.redirect('/auth/forgot-password');
  }
};

// Email verification
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error_msg', 'Verification token is invalid or has expired');
      return res.redirect('/auth/login');
    }
    
    // Mark as verified and clear token
    user.isVerified = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    req.flash('success_msg', 'Your account has been verified! You can now log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred during verification');
    res.redirect('/auth/login');
  }
};
