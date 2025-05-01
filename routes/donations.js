/*// routes/donations.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const User = require('../models/User');

// @route    POST /food-donate
// @desc     Create a new donation
router.post('/food-donate', async (req, res) => {
  try {
    // Log the user for debugging
    console.log('User:', req.user); // Ensure user object is populated

    const {
      foodname, meal, category, quantity, amount, expirationDate,
      name, phoneno, phone, district, location, address, pickupTime,pincode,
    } = req.body;

    // Use the user ID from the middleware for the donor
    const donorId = req.user?._id || req.user?.id;
    console.log('Donor ID:', donorId); // Log the donor ID for debugging

    // Ensure donorId exists
    if (!donorId) {
      console.error('Missing donorId');
      return res.status(400).json({ message: 'Donor ID is missing.' });
    }

    // Ensure pickupTime is a valid date if provided
    const pickupDate = pickupTime ? new Date(pickupTime) : null;
    if (pickupTime && isNaN(pickupDate)) {
      return res.status(400).json({ message: 'Invalid pickup time provided.' });
    }

    // Create the new donation object
    const newDonation = new Donation({
      foodname, meal, category, quantity, amount, expirationDate,
      name, phoneno, phone, district, location, address,pincode,
      status: 'Pending', // Default status is Pending
      pickupTime: pickupDate,
      donorId,
    });

    // Log the donation object for debugging
    console.log('New Donation:', newDonation);

    // Save the donation to the database
    await newDonation.save();
    res.status(201).json({
      message: 'Donation recorded successfully',
      donation: newDonation // Returning the donation object
    });
  } catch (error) {
    console.error('Error in /food-donate:', error);
    res.status(500).json({ message: 'Something went wrong, please try later.', error: error.message });
  }
});
// @route    POST /food-donate
// POST /food-donate
/*router.post('/food-donate', async (req, res) => {
  try {
    const {
      foodname, meal, category, quantity, amount, expirationDate,
      name, phoneno, phone, district, location, address, pickupTime // <-- now included
    } = req.body;

    const donorId = req.user?._id || req.user?.id;
    if (!donorId) {
      return res.status(400).json({ message: 'Donor ID is missing.' });
    }

    const newDonation = new Donation({
      foodname, meal, category, quantity, amount, expirationDate,
      name, phoneno, phone, district, location, address,
      status: 'pending', // initial state
      pickupTime: new Date(pickupTime),
      donorId,
    });

    await newDonation.save();

    res.status(201).json({ message: 'Donation submitted successfully.' });

  } catch (error) {
    console.error('Error in /food-donate:', error);
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
});



// @route    GET /donations
// @desc     Get all donations (can filter by donorId or category)
router.get('/donations', async (req, res) => {
  try {
    const { donorId, category } = req.query;

    const query = {};
    if (donorId) query.donorId = donorId;
    if (category) query.category = category;

    const donations = await Donation.find(query).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Failed to fetch donations', error });
  }
});

router.get('/donor-feedback', (req, res) => {
  res.render('donor-feedback' , { noFooter:true}); // Replace with the correct view file
});
// Define the POST route to handle feedback submission
router.post('/donor-feedback', async (req, res) => {
  try {
    // You can process the feedback data here
    const { name, email, message, rating } = req.body;

    // Perform any necessary actions like saving feedback to a database
    // Example: await Feedback.create({ name, email, message, rating });

    // Respond with a success message or redirect
    res.send('Feedback submitted successfully!');
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).send('Error submitting feedback');
  }
});*/

// routes/donations.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const User = require('../models/User');

// @route    POST /food-donate
// @desc     Create a new donation
router.post('/food-donate', async (req, res) => {
  try {
    // Log the user for debugging
    console.log('User:', req.user); // Ensure user object is populated

    const {
      foodname, meal, category, quantity, amount, expirationDate,
      name, phoneno, phone, district, location, address, pickupTime, pincode
    } = req.body;

    // Ensure donorId exists
    const donorId = req.user?._id || req.user?.id;
    console.log('Donor ID:', donorId); // Log the donor ID for debugging

    if (!donorId) {
      console.error('Missing donorId');
      return res.status(400).json({ message: 'Donor ID is missing.' });
    }

    // Validate pincode (assuming a 6-digit pincode)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      console.error('Invalid pincode');
      return res.status(400).json({ message: 'Invalid pincode. Please provide a 6-digit pincode.' });
    }

    // Ensure pickupTime is a valid date if provided
    const pickupDate = pickupTime ? new Date(pickupTime) : null;
    if (pickupTime && isNaN(pickupDate)) {
      return res.status(400).json({ message: 'Invalid pickup time provided.' });
    }

    // Create the new donation object
    const newDonation = new Donation({
      foodname, meal, category, quantity, amount, expirationDate,
      name, phoneno, phone, district, location, address, pincode, // Include pincode here
      status: 'Pending', // Default status is Pending
      pickupTime: pickupDate,
      donorId,
    });

    // Log the donation object for debugging
    console.log('New Donation:', newDonation);

    // Save the donation to the database
    await newDonation.save();
    res.status(201).json({
      message: 'Donation recorded successfully',
      donation: newDonation // Returning the donation object
    });
  } catch (error) {
    console.error('Error in /food-donate:', error);
    res.status(500).json({ message: 'Something went wrong, please try later.', error: error.message });
  }
});

// @route    GET /donations
// @desc     Get all donations (can filter by donorId or category)
router.get('/donations', async (req, res) => {
  try {
    const { donorId, category } = req.query;

    const query = {};
    if (donorId) query.donorId = donorId;
    if (category) query.category = category;

    const donations = await Donation.find(query).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Failed to fetch donations', error });
  }
});

// Route to get feedback from donor
router.get('/donor-feedback', (req, res) => {
  res.render('donor-feedback', { noFooter: true }); // Replace with the correct view file
});

// Define the POST route to handle feedback submission
router.post('/donor-feedback', async (req, res) => {
  try {
    // You can process the feedback data here
    const { name, email, message, rating } = req.body;

    // Perform any necessary actions like saving feedback to a database
    // Example: await Feedback.create({ name, email, message, rating });

    // Respond with a success message or redirect
    res.send('Feedback submitted successfully!');
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).send('Error submitting feedback');
  }
});

module.exports = router;



