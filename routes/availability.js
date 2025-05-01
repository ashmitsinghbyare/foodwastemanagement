const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');

const Availability = require('../models/Availability');
// Assuming this model exists
const User = require('../models/User'); // Assuming this model exists

// Example route to get donor availability
/*router.get('/availability', async (req, res) => {
  try {
    // Fetch the donorId from the session (if the user is logged in)
    const donorId = req.session.user?.id;

    if (!donorId) {
      return res.status(400).json({ message: 'No donor ID found in session.' });
    }

    // Fetch the donor's information
    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    // Fetch the donor's donations that are not marked as 'Completed'
    const donations = await Donation.find({
      donorId: donorId,
      status: { $ne: 'Completed' }
    });

    // Calculate available items based on quantity of donations
    const availableItems = donations.reduce((total, donation) => {
      return total + (donation.quantityNumeric || 0); // Assuming quantityNumeric holds the number of items
    }, 0);

    // Fetch the next scheduled pickup time
    const nextPickupDonation = await Donation.findOne({
      donorId: donorId,
      status: 'Scheduled',
      pickupTime: { $gte: new Date() } // Only future pickups
    }).sort({ pickupTime: 1 });

    const nextPickup = nextPickupDonation ? nextPickupDonation.pickupTime : null;

    // Check if the donor has any available items
    const status = availableItems > 0 ? 'Available' : 'Unavailable';

    // Check if availability record exists for the donor
    let availability = await Availability.findOne({ donorId });

    if (!availability) {
      // If no availability record exists, create a new one
      availability = new Availability({
        donorId: donorId,
        availableItems: availableItems,
        nextPickup: nextPickup,
        status: status
      });
      await availability.save();
    } else {
      // If an availability record exists, update it
      availability.availableItems = availableItems;
      availability.nextPickup = nextPickup;
      availability.status = status;
      await availability.save();
    }

    // Return the updated availability information
    res.status(200).json({
      availableItems,
      nextPickup: nextPickup ? nextPickup.toLocaleString() : 'No upcoming pickups',
      status,
      donorName: donor.name
    });
  } catch (error) {
    console.error('Error fetching donor availability:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

*/

router.get('/availability', async (req, res) => {
  try {
    // Fetch the donorId from the session (if the user is logged in)
    const donorId = req.session.user?.id;

    if (!donorId) {
      console.log("No donorId found in session.");
      return res.status(400).json({ message: 'No donor ID found in session.' });
    }

    console.log("Donor ID:", donorId);

    // Fetch the donor's information
    const donor = await User.findById(donorId);
    if (!donor) {
      console.log("Donor not found:", donorId);
      return res.status(404).json({ message: 'Donor not found.' });
    }

    console.log("Donor:", donor);

    // Fetch the donor's donations that are not marked as 'Completed'
    const donations = await Donation.find({
      donorId: donorId,
      status: { $ne: 'Completed' }
    });

    console.log("Donations:", donations);

    // Calculate available items based on quantity of donations
    const availableItems = donations.reduce((total, donation) => {
      return total + (donation.quantityNumeric || 0); // Assuming quantityNumeric holds the number of items
    }, 0);

    // Fetch the next scheduled pickup time
    const nextPickupDonation = await Donation.findOne({
      donorId: donorId,
      status: 'Scheduled',
      pickupTime: { $gte: new Date() } // Only future pickups
    }).sort({ pickupTime: 1 });

    console.log("Next Pickup Donation:", nextPickupDonation);

    const nextPickup = nextPickupDonation ? nextPickupDonation.pickupTime : null;

    // Check if the donor has any available items
    const status = availableItems > 0 ? 'Available' : 'Unavailable';

    // Check if availability record exists for the donor
    let availability = await Availability.findOne({ donorId });

    console.log("Availability Record:", availability);

    if (!availability) {
      // If no availability record exists, create a new one
      availability = new Availability({
        donorId: donorId,
        availableItems: availableItems,
        nextPickup: nextPickup,
        status: status
      });
      await availability.save();
    } else {
      // If an availability record exists, update it
      availability.availableItems = availableItems;
      availability.nextPickup = nextPickup;
      availability.status = status;
      await availability.save();
    }

    // Return the updated availability information
    res.status(200).json({
      availableItems,
      nextPickup: nextPickup ? nextPickup.toLocaleString() : 'No upcoming pickups',
      status,
      donorName: donor.name
    });
  } catch (error) {
    console.error('Error fetching donor availability:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


module.exports = router;
