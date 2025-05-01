/*// routes/history.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const dayjs = require('dayjs');
// Utility function to assign status classes
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
}

// @route GET /donation-history
/*router.get('/history', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });

        const donationData = donations.map(d => ({
            date: d.createdAt.toLocaleDateString(),
            type: d.category || d.meal,
            quantity: d.quantity,
            expiry: d.expirationDate ? new Date(d.expirationDate).toLocaleDateString() : 'N/A',

            status: d.status || 'Pending'
        }));

        res.render('history', {
            hideNavbar: true, noFooter: true,
            donationData,
            getStatusClass
        });
    } catch (error) {
        console.error('Error loading donation history:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/history', async (req, res) => {
    try {
      const donations = await  Donation.find().sort({ createdAt: -1 });
  
      const donationData = donations.map(d => ({
        date: d.createdAt.toLocaleDateString(),
        type: d.category || d.meal,
        quantity: d.quantity,
        expiry: d.expirationDate ? new Date(d.expirationDate).toLocaleDateString() : 'N/A',

        pickupTime: d.pickupTime ? new Date(d.pickupTime).toLocaleString() : 'Not set', // ✅ Include this
        status: d.status || 'Pending'
      }));
  
      res.render('history', {
        hideNavbar: true,
        noFooter: true,
        donationData,
        getStatusClass
      });
    } catch (error) {
      console.error('Error loading donation history:', error);
      res.status(500).send('Server Error');
    }
  });*

 

router.get('/history', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });

    const donationData = donations.map(d => ({
      date: dayjs(d.createdAt).format('YYYY-MM-DD'),
      type: d.category || d.meal,
      quantity: d.quantity,
      expiry: d.expirationDate ? dayjs(d.expirationDate).format('YYYY-MM-DD') : 'N/A',
      pickupTime: d.pickupTime ? dayjs(d.pickupTime).format('YYYY-MM-DD HH:mm') : 'Not set',
      status: d.status || 'Pending'
    }));

    res.render('history', {
      hideNavbar: true,
      noFooter: true,
      donationData,
      getStatusClass
    });
  } catch (error) {
    console.error('Error loading donation history:', error);
    res.status(500).send('Server Error');
  }
});

  */
const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const dayjs = require('dayjs');
const { createNotification } = require('../services/notifications'); // Assuming this is your notification service

// Utility function to assign status classes
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'pending': return 'status-pending';
        default: return 'status-default';
    }
}

// @route GET /donation-history
router.get('/history', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });

        const donationData = donations.map(d => {
            // Trigger notification if the donation status is changed to "completed"
            if (d.status === 'Completed') {
                const userId = d.donorId; // Assume `donorId` is stored in the donation model
                const icon = 'fa-check-circle';
                const message = `Your donation of ${d.foodname} has been successfully completed. Thank you for your generosity!`;
                createNotification(userId, icon, message);
            }

            return {
                date: dayjs(d.createdAt).format('YYYY-MM-DD'),
                type: d.category || d.meal,
                quantity: d.quantity,
                expiry: d.expirationDate ? dayjs(d.expirationDate).format('YYYY-MM-DD') : 'N/A',
                pickupTime: d.pickupTime ? dayjs(d.pickupTime).format('YYYY-MM-DD HH:mm') : 'Not set',
                status: d.status || 'Pending'
            };
        });

        res.render('history', {
            hideNavbar: true,
            noFooter: true,
            donationData,
            getStatusClass
        });
    } catch (error) {
        console.error('Error loading donation history:', error);
        res.status(500).send('Server Error');
    }
});



module.exports = router;
