/*const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const Notification = require('../models/Notification'); // Assuming you have a Notification model
const { createNotification } = require('../services/notifications');

// Show all orders (admin/volunteer dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await Donation.find().sort({ createdAt: -1 });
    res.render('orders', {
      orders,
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Server Error');
  }
});

// Accept/schedule an order (mark as scheduled)
/*router.post('/:id/schedule', async (req, res) => {
  try {
    await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Scheduled'
    });
    res.redirect('/orders');
  } catch (err) {
    console.error('Error scheduling order:', err);
    res.status(500).send('Error scheduling order');
  }
});*
router.post('/:id/schedule', async (req, res) => {
  try {
    const { pickupTime } = req.body;
    await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Scheduled',
      pickupTime: pickupTime ? new Date(pickupTime) : undefined
    });
    res.redirect('/orders');
  } catch (err) {
    console.error('Error scheduling order:', err);
    res.status(500).send('Error scheduling order');
  }
});


// Confirm an order (mark as completed)
router.post('/:id/confirm', async (req, res) => {
  try {
    await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Completed'
    });
    res.redirect('/orders');
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming order');
  }
});

module.exports = router;
*/
const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const Notification = require('../models/Notification'); // Assuming you have a Notification model
const { createNotification } = require('../services/notifications');

// Show all orders (admin/volunteer dashboard)
router.get('/', async (req, res) => {
  try {
    const orders = await Donation.find().sort({ createdAt: -1 });
    res.render('orders', {
      orders,
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Server Error');
  }
});

// Accept/schedule an order (mark as scheduled)
/*router.post('/:id/schedule', async (req, res) => {
  try {
    const { pickupTime } = req.body;

    // Ensure pickupTime is a valid date if provided
    if (pickupTime && isNaN(new Date(pickupTime))) {
      return res.status(400).send('Invalid pickup time');
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Scheduled',
      pickupTime: pickupTime ? new Date(pickupTime) : undefined
    });

    if (!donation) {
      return res.status(404).send('Order not found');
    }

    res.redirect('/orders');
  } catch (err) {
    console.error('Error scheduling order:', err);
    res.status(500).send('Error scheduling order');
  }
});

// Confirm an order (mark as completed)
router.post('/:id/confirm', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Completed'
    });

    if (!donation) {
      return res.status(404).send('Order not found');
    }

    res.redirect('/orders');
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming order');
  }
});*/

// Accept/schedule an order (mark as scheduled)
router.post('/:id/schedule', async (req, res) => {
  try {
    const { pickupTime } = req.body;

    // Ensure pickupTime is a valid date if provided
    if (pickupTime && isNaN(new Date(pickupTime))) {
      return res.status(400).send('Invalid pickup time');
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Scheduled',
      pickupTime: pickupTime ? new Date(pickupTime) : undefined
    });

    if (!donation) {
      return res.status(404).send('Order not found');
    }

    // Create a notification for the user
    const userId = donation.userId; // Assuming donation has a userId field
    const icon = 'fa-circle-check'; // You can customize the icon
    const message = `Your food pickup from ${donation.donorName} has been scheduled for ${pickupTime ? new Date(pickupTime).toLocaleString() : 'TBD'}.`;

    await createNotification(userId, icon, message); // Call the notification function

    res.redirect('/orders');
  } catch (err) {
    console.error('Error scheduling order:', err);
    res.status(500).send('Error scheduling order');
  }
});

// Confirm an order (mark as completed)
router.post('/:id/confirm', async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Completed'
    });

    if (!donation) {
      return res.status(404).send('Order not found');
    }

    // Create a notification for the user
    const userId = donation.userId; // Assuming donation has a userId field
    const icon = 'fa-check-circle'; // You can customize the icon
    const message = `Your food pickup from ${donation.donorName} has been completed. Thank you for your support!`;

    await createNotification(userId, icon, message); // Call the notification function

    res.redirect('/orders');
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming order');
  }
});



module.exports = router;
