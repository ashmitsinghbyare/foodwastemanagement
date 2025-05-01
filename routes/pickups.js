// routes/pickups.js
/*const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const { ensureAuthenticated } = require('../middlewares/isAuthenticated'); // Ensure user is authenticated

// @route GET /api/pickups
// @desc Get all pickups for the logged-in user
/*router.get('/', async (req, res) => {
  try {
    const donorId = req.user._id;  // Ensure you're getting the user ID from authentication
    const pickups = await Donation.find({ donorId: donorId, pickupTime: { $exists: true } })  // Fetch donations with a pickup time
      .select('pickupTime status') // Only select the necessary fields
      .sort({ pickupTime: 1 }); // Optional: Sort by pickup time

    res.json(pickups);
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ message: 'Failed to fetch pickups' });
  }
});*
router.get('/', async (req, res) => {
  try {
    const pickups = await Donation.find({ donorId: req.user._id })
      .select('pickupTime status')
      .sort({ pickupTime: 1 });

    res.json(pickups);
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ message: 'Failed to fetch pickups' });
  }
});


// @route POST /api/pickups
// @desc Schedule a new pickup (by creating a new donation with pickup time)
router.post('/', async (req, res) => {
  try {
    // Assuming that pickupTime and other donation details are passed in the request body
    const { foodname, meal, category, quantity, expirationDate, name, phoneno, district, address, pickupTime } = req.body;
    const donorId = req.user._id;  // Ensure you're getting the user ID from authentication

    if (!pickupTime) {
      return res.status(400).json({ message: 'Pickup time is required' });
    }

    // Create a new donation entry with the pickup time
    const newDonation = new Donation({
      foodname,
      meal,
      category,
      quantity,
      expirationDate,
      name,
      phoneno,
      district,
      address,
      donorId,
      pickupTime,
      status: 'Scheduled' // Mark the donation as scheduled for pickup
    });

    // Save the new donation (pickup)
    await newDonation.save();
    res.status(201).json(newDonation); // Send back the created donation
  } catch (error) {
    console.error('Error scheduling pickup:', error);
    res.status(400).json({ message: error.message });
  }
});*

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const pickups = await Donation.find({ donorId: req.user._id })
      .select('pickupTime status')
      .sort({ pickupTime: 1 });

    res.json(pickups);
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ message: 'Failed to fetch pickups' });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const { foodname, meal, category, quantity, expirationDate, name, phoneno, district, address, pickupTime } = req.body;

    if (!pickupTime || !foodname || !quantity) {
      return res.status(400).json({ message: 'Pickup time, food name and quantity are required' });
    }

    const newDonation = new Donation({
      foodname,
      meal,
      category,
      quantity,
      expirationDate,
      name,
      phoneno,
      district,
      address,
      donorId: req.user._id,
      pickupTime: new Date(pickupTime),
      status: 'Scheduled'
    });

    await newDonation.save();
    res.status(201).json(newDonation);
  } catch (error) {
    console.error('Error scheduling pickup:', error);
    res.status(400).json({ message: error.message });
  }
});


// @route GET /api/pickups/:donorId
// @desc Get all pickups for a specific donor
router.get('/:donorId', async (req, res) => {
  try {
    const pickups = await Donation.find({ donorId: req.params.donorId });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/pickups/:id
// @desc Update a pickup status (e.g., mark as "Completed")
router.put('/:id', async (req, res) => {
  try {
    const pickup = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }
    res.json(pickup);  // Return the updated pickup info
  } catch (error) {
    console.error('Error updating pickup status:', error);
    res.status(400).json({ message: error.message });
  }
});*/

const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const { ensureAuthenticated } = require('../middlewares/auth'); // Ensure user is authenticated
const { createNotification } = require('../services/notifications'); // Assuming you have a notifications service

// @route GET /api/pickups
// @desc Get all pickups for the logged-in user
router.get('/',  async (req, res) => {
  try {
    const pickups = await Donation.find({ donorId: req.user._id })
      .select('pickupTime status')
      .sort({ pickupTime: 1 });

    res.json(pickups);
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ message: 'Failed to fetch pickups' });
  }
});

// @route POST /api/pickups
// @desc Schedule a new pickup (by creating a new donation with pickup time)
router.post('/',  async (req, res) => {
  try {
    const { foodname, meal, category, quantity, expirationDate, name, phoneno, district, address, pickupTime } = req.body;

    if (!pickupTime || !foodname || !quantity) {
      return res.status(400).json({ message: 'Pickup time, food name and quantity are required' });
    }

    // Create a new donation entry with the pickup time
    const newDonation = new Donation({
      foodname,
      meal,
      category,
      quantity,
      expirationDate,
      name,
      phoneno,
      district,
      address,
      donorId: req.user._id,
      pickupTime: new Date(pickupTime),
      status: 'Scheduled'
    });

    await newDonation.save();

    // Create a notification for the user
    const userId = req.user._id; // Get user ID from authenticated session
    const icon = 'fa-circle-check'; // You can choose the icon you like
    const message = `Your food donation of ${foodname} has been scheduled for pickup on ${new Date(pickupTime).toLocaleString()}.`;

    // Create the notification
    await createNotification(userId, icon, message);

    res.status(201).json(newDonation);
  } catch (error) {
    console.error('Error scheduling pickup:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/pickups/:donorId
// @desc Get all pickups for a specific donor
router.get('/:donorId', async (req, res) => {
  try {
    const pickups = await Donation.find({ donorId: req.params.donorId });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/pickups/:id
// @desc Update a pickup status (e.g., mark as "Completed")
router.put('/:id', async (req, res) => {
  try {
    const pickup = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // If the pickup status is updated to "Completed"
    if (pickup.status === 'Completed') {
      // Create a notification for the user
      const userId = pickup.donorId; // Get the user ID from the donation
      const icon = 'fa-check-circle'; // You can choose the icon you like
      const message = `Your food donation of ${pickup.foodname} has been successfully completed. Thank you for your contribution!`;

      // Create the notification
      await createNotification(userId, icon, message);
    }

    res.json(pickup);  // Return the updated pickup info
  } catch (error) {
    console.error('Error updating pickup status:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;


