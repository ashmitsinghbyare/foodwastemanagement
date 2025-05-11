const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

/**
 * @route   POST /feedback/submit
 * @desc    Submit user feedback
 * @access  Private
 */
router.post('/submit', ensureAuthenticated, async (req, res) => {
  try {
    const { rating, message, allowPublic } = req.body;
    
    if (!rating) {
      req.flash('error', 'Rating is required');
      return res.redirect('back');
    }
    
    // Create new feedback
    const feedback = new Feedback({
      user: req.user._id,
      rating: parseInt(rating),
      message,
      allowPublic: allowPublic === 'on'
    });
    
    await feedback.save();
    
    try {
      // Create notification for admin
      await createNotification({
        recipientId: null, // will go to admins
        type: 'feedback',
        message: `New feedback submitted by ${req.user.name}`,
        relatedTo: {
          model: 'Feedback',
          id: feedback._id
        },
        url: '/feedback/admin'
      });
    } catch (notifyErr) {
      console.error('Error sending admin notification:', notifyErr);
      // Continue with the function even if notification fails
    }
    
    req.flash('success', 'Thank you for your feedback!');
    return res.redirect('back');
  } catch (err) {
    console.error('Error submitting feedback:', err);
    req.flash('error', 'Failed to submit feedback');
    return res.redirect('back');
  }
});

/**
 * @route   GET /feedback/admin
 * @desc    Display admin feedback management
 * @access  Admin only
 */
router.get('/admin', ensureAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find({}).populate('user', 'name email role profileImage').sort({ createdAt: -1 });
    
    return res.render('admin/feedback', {
      title: 'Manage Feedback',
      feedback
    });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    req.flash('error', 'Failed to load feedback data');
    return res.redirect('/admin/dashboard');
  }
});

/**
 * @route   POST /feedback/testimonial/:id
 * @desc    Toggle testimonial status
 * @access  Admin only
 */
router.post('/testimonial/:id', ensureAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    
    // Toggle testimonial status
    feedback.isTestimonial = !feedback.isTestimonial;
    await feedback.save();
    
    return res.json({ 
      success: true,
      isTestimonial: feedback.isTestimonial
    });
  } catch (err) {
    console.error('Error updating testimonial status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /feedback/testimonials
 * @desc    Get testimonials for homepage
 * @access  Public
 */
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Feedback.find({ isTestimonial: true })
      .populate('user', 'name role profileImage')
      .sort({ createdAt: -1 })
      .limit(6);
    
    return res.json({ success: true, testimonials });
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Route to delete feedback
router.delete('/delete/:id', ensureAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
});

module.exports = router;
