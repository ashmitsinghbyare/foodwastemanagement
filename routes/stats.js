const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const moment = require('moment');

// Route to render stats page
router.get('/stats', async (req, res) => {
  try {
    const userId = req.session.userId || req.user._id;
    // Replace with dynamic userId from the session (if logged in)
    console.log('User ID:', userId);

    const totalDonated = await Donation.aggregate([
      { $match: { donorId: userId } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    
    console.log('Total Donated:', totalDonated);

    // Scheduled pickups (only those with status 'Scheduled')
    const scheduledPickups = await Donation.countDocuments({
      donorId: userId,
      status: 'Scheduled'
    });
    
    console.log('Scheduled Pickups:', scheduledPickups);

    // Expiring soon items (expiring in the next 7 days)
    const expiringSoon = await Donation.countDocuments({
      donorId: userId,
      expirationDate: { $lte: moment().add(7, 'days').toDate() },
      status: { $ne: 'Completed' }
    });
    
    console.log('Expiring Soon:', expiringSoon);

    res.render('stats', {
      totalDonated: totalDonated[0] ? totalDonated[0].total : 0,
      scheduledPickups,
      expiringSoon,
      hideNavbar:true,
      noFooter:true
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).send('Server Error');
  }
});
// @desc     Render the stats page with dynamic data


module.exports = router;
