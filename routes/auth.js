const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth');

// Login page
router.get('/login', forwardAuthenticated, authController.getLogin);

// Register page
router.get('/register', forwardAuthenticated, authController.getRegister);

// Process login form
router.post('/login', authController.postLogin);

// Process register form
router.post('/register', authController.postRegister);

// Logout
router.get('/logout', authController.logout);

// Forgot password page
router.get('/forgot-password', forwardAuthenticated, authController.getForgotPassword);

// Process forgot password
router.post('/forgot-password', authController.postForgotPassword);

// Reset password page (with token)
router.get('/reset-password/:token', forwardAuthenticated, authController.getResetPassword);

// Process reset password
router.post('/reset-password/:token', authController.postResetPassword);

// Email verification
router.get('/verify/:token', authController.verifyEmail);

module.exports = router;
