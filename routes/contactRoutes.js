const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Import the Message model

// POST route for Contact Us form submission

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    // Render the contact page with a success message
    res.render('pages/contact', {
      title: 'Contact Us',
      navbar: 'contact',
      activePage: 'contact',
      hideNavbar: true,
      noFooter: true,
      successMessage: '✅ Thank you! We’ll contact you within 48 hours.',
      errorMessage: null
    });
  } catch (err) {
    console.error(err);
    res.render('pages/contact', {
      title: 'Contact Us',
      navbar: 'contact',
      activePage: 'contact',
      hideNavbar: true,
      noFooter: true,
      successMessage: null,
      errorMessage: '❌ There was an error. Please try again later.'
    });
  }
});

  
module.exports = router;
