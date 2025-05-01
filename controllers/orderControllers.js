// controllers/orderController.js
const Donation = require('../models/donation');

exports.scheduleOrder = async (req, res, redirectPath) => {
  try {
    const { pickupTime } = req.body;
    await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Scheduled',
      pickupTime: pickupTime ? new Date(pickupTime) : undefined
    });
    res.redirect(redirectPath);
  } catch (err) {
    console.error('Error scheduling order:', err);
    res.status(500).send('Error scheduling order');
  }
};

exports.confirmOrder = async (req, res, redirectPath) => {
  try {
    await Donation.findByIdAndUpdate(req.params.id, { status: 'Completed' });
    res.redirect(redirectPath);
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming order');
  }
};
