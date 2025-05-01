/*const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Donation = require('../models/donation');
const { checkRole } = require('../middlewares/middleware'); 
// Admin Dashboard Route
const restrictDashboardAccess = require('../middlewares/restrictDashboardAccess');
router.use('/', restrictDashboardAccess);


/*router.get('/' , async (req, res) => {
  try {
      const totalUsers = await User.countDocuments();
      const totalFeedbacks = await Feedback.countDocuments();
      const totalDonations = await Donation.countDocuments();
 
      const recentDonations = await Donation.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('donorId', 'firstName lastName');

     /* const formattedDonations = recentDonations.map(donation => ({
          donorName: donation.donorId ? `${donation.donorId.firstName} ${donation.donorId.lastName}` : 'Unknown',
          foodName: donation.foodName || 'N/A',
          amount: donation.amount || 0,
          createdAt: donation.createdAt
      }));//

const formattedDonations = recentDonations.map(donation => ({
  donorName: donation.donorId
    ? `${donation.donorId.firstName} ${donation.donorId.lastName}`
    : donation.name || 'Unknown',
  foodName: donation.foodname || 'N/A',
  quantity: donation.quantity ? donation.quantity : 'N/A' , // If quantity is empty, show 'N/A'
  //numericQuantity: donation.numericQuantity || 0, 
  createdAt: donation.createdAt
}));




      res.render('admin/dashboard', {
          totalUsers,
          totalFeedbacks,
          totalDonations,
          recentDonations: formattedDonations,
          user: req.session.user, // optional, if you're showing logged-in user data
          hideNavbar: true,
          noFooter: true,
         
      });
  } catch (err) {
      console.error('Dashboard rendering failed:', err);
      res.status(500).send('Error loading dashboard');
  }
});
*/
/*router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is provided
    const limit = 5; // Number of donations per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const totalUsers = await User.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();
    const totalDonations = await Donation.countDocuments(); // Total number of donations
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName');

    const formattedDonations = recentDonations.map(donation => ({
      donorName: donation.donorId
        ? `${donation.donorId.firstName} ${donation.donorId.lastName}`
        : donation.name || 'Unknown',
      foodName: donation.foodname || 'N/A',
      quantity: donation.quantity || 'N/A',
      createdAt: donation.createdAt
    }));

    // Pass the current page, the total number of donations, and formatted donations to the view
    res.render('admin/dashboard', {
      totalUsers,
      totalFeedbacks,
      totalDonations,
      currentPage: page,
      totalPages: Math.ceil(totalDonations / limit),
      recentDonations: formattedDonations,
      hideNavbar: true,
      noFooter: true,
     
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});

router.get('/', async (req, res) => {
  try {
    // Retrieve the current page from the query string or default to 1
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is provided
    const limit = 5; // Number of donations per page
    const skip = (page - 1) * limit; // Calculate how many records to skip

    // Get total number of users, feedbacks, and donations
    const totalUsers = await User.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();
    const totalDonations = await Donation.countDocuments(); // Total number of donations

    // Fetch recent donations, sorted by creation date
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName');

    // Format the donations data to include donor names and other details
    const formattedDonations = recentDonations.map(donation => ({
      donorName: donation.donorId
        ? `${donation.donorId.firstName} ${donation.donorId.lastName}`
        : donation.name || 'Unknown',
      foodName: donation.foodname || 'N/A',
      quantity: donation.quantity || 'N/A',
      createdAt: donation.createdAt
    }));

    // Calculate the total pages based on the total donations and the items per page
    const totalPages = Math.ceil(totalDonations / limit);

    // Pass the current page, total pages, total donations, and formatted donations to the view
    res.render('admin/dashboard', {
      totalUsers,
      totalFeedbacks,
      totalDonations,
      currentPage: page,
      totalPages,
      recentDonations: formattedDonations,
      hideNavbar: true,
      noFooter: true,
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});






router.get('/analytics', async(req, res) => {
   
        try {
            const totalUsers = await User.countDocuments();
            const totalFeedbacks = await Feedback.countDocuments();
            const totalDonations = await Donation.countDocuments();
    
            res.render('analytics', {
                totalUsers,
                totalFeedbacks,
                totalDonations,
                darkMode: false, // or dynamically switch this
                hideNavbar: true,
                noFooter: true,
                user: req.session.user, // optional, if you're showing logged-in user data
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    });

    router.get('/donate', (req, res) => {
        res.render('donate' , {
          hideNavbar: true,
          noFooter: true,
        }); // renders views/adminDashboard.ejs
      });
      // API endpoint for fetching location-based data
    
// Backend route for donations (Express)
// Backend route to fetch donations
/*router.get('/donations', async (req, res) => {
    try {
        const location = req.query.location;
        console.log('Received location:', location);  // Debugging log
    
        // Query MongoDB for donations based on location
        const donations = await Donation.find({ location });
        console.log('Donations found:', donations);  // Debugging log
    
        res.json(donations);  // Return donations as JSON
        
    } catch (err) {
        console.error('Error fetching donations:', err);
        res.status(500).json({ error: 'Unable to fetch donations' });
    }
    
});*/

/*router.get('/donations', async (req, res) => {
    try {
      const location = req.query.location;
  
      if (!location) {
        return res.status(400).json({ error: 'Location is required' });
      }
  
      console.log('Received location:', location);
  
      const donations = await Donation.find({
        location: new RegExp(`^${location}$`, 'i') // case-insensitive match
      });
  
      console.log('Donations found:', donations);
      res.json(donations);
    } catch (err) {
      console.error('Error fetching donations:', err);
      res.status(500).json({ error: 'Unable to fetch donations' });
    }
  });
  
  router.get('/donations', async (req, res) => {
    try {
      const location = req.query.location?.trim(); // remove extra spaces
      console.log('Received location:', location);
  
      if (!location) {
        return res.status(400).json({ error: 'Location query parameter is required' });
      }
  
      // Case-insensitive search for location or district
      const donations = await Donation.find({
        $or: [
          { location: { $regex: new RegExp(location, 'i') } },
          { district: { $regex: new RegExp(location, 'i') } }
        ]
      });
  
      console.log('Donations found:', donations.length);
      res.json(donations);
    } catch (err) {
      console.error('Error fetching donations:', err);
      res.status(500).json({ error: 'Unable to fetch donations' });
    }
  });
  

module.exports = router;*/
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Donation = require('../models/donation');
const restrictDashboardAccess = require('../middlewares/restrictDashboardAccess');
const { checkRole } = require('../middlewares/middleware');

// Apply the dashboard access restriction middleware to all routes
router.use('/', restrictDashboardAccess);

// Admin Dashboard Route
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page is provided
    const limit = 5; // Donations per page
    const skip = (page - 1) * limit; // How many donations to skip

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();
    const totalDonations = await Donation.countDocuments();

    // Fetch recent donations with pagination
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('donorId', 'firstName lastName') // Ensure this is populated correctly
      .lean();

      
    // Format donations to include donor details
    const formattedDonations = recentDonations.map(donation => ({
      donorName: donation.donorId ? `${donation.donorId.firstName} ${donation.donorId.lastName}` : 'Unknown',
      foodName: donation.foodname || 'N/A',
      quantity: donation.quantity || 'N/A',
      createdAt: donation.createdAt
    }));

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalDonations / limit);

    // Render the dashboard with the data
    res.render('admin/dashboard', {
      totalUsers,
      totalFeedbacks,
      totalDonations,
      currentPage: page,
      totalPages,
      recentDonations: formattedDonations,
      hideNavbar: true,
      noFooter: true,
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});

// Analytics route
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();
    const totalDonations = await Donation.countDocuments();

    res.render('analytics', {
      totalUsers,
      totalFeedbacks,
      totalDonations,
      darkMode: false, // Dynamically switch this if needed
      hideNavbar: true,
      noFooter: true,
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Donation page
router.get('/donate', (req, res) => {
  res.render('donate', {
    hideNavbar: true,
    noFooter: true,
  });
});

// Donations API route with location-based filtering
router.get('/donations', async (req, res) => {
  try {
    const location = req.query.location?.trim(); // Trim extra spaces if any
    console.log('Received location:', location);

    // Validate location query parameter
    if (!location) {
      return res.status(400).json({ error: 'Location query parameter is required' });
    }

    // Case-insensitive search for donations based on location or district
    const donations = await Donation.find({
      $or: [
        { location: { $regex: new RegExp(location, 'i') } },
        { district: { $regex: new RegExp(location, 'i') } }
      ]
    });

    console.log('Donations found:', donations.length);
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ error: 'Unable to fetch donations' });
  }
});

module.exports = router;
