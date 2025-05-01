const express = require('express');
const router = express.Router();
const { checkRole } = require('../middlewares/middleware'); 
const restrictDashboardAccess = require('../middlewares/restrictDashboardAccess');
const Receiver = require('../models/Receiver');
const Pickup = require('../models/pickup');
//const { ensureAuthenticated } = require('../middlewares/auth');
// Assuming you're using multer for image uploads
const multer = require('multer');
const Feedback = require('../models/Feedback'); 
const path = require('path');
const { scheduleOrder, confirmOrder } = require('../controllers/orderControllers');
const Donation = require('../models/donation'); // Assuming you have a Donation model
const Notification = require('../models/Notification'); 
const { createNotification } = require('../services/notifications'); 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');  // Save to public images folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});
const orderController = require('../controllers/orderControllers');


const upload = multer({ storage: storage });

router.use('/receiver-dashboard', restrictDashboardAccess);
// Sample dummy data (in place of a DB)
const receiverProfile = {
  orgName: 'Community Food Bank',
  contactEmail: 'contact@cfb.org',
  phone: '+1234567890'
};
// GET Receiver Profile Page


/*router.get('/Rprofile', async (req, res) => {
  try {
    // ✅ Check for logged-in user
    if (!req.session || !req.session.user) {
      return res.redirect('/login'); // or handle unauthorized access
    }

    const userId = req.session.user._id;

    // ✅ Fetch user from DB to get latest data
    const receiverProfile = await Receiver.findById(userId);

    if (!receiverProfile) {
      return res.status(404).send('Receiver profile not found');
    }

    res.render('Rprofile', {
      user: receiverProfile,  // ✅ Pass full user object
      hideNavbar: true,
      noFooter: true
    });
    
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Error loading profile');
  }
});
*/
  
 // POST to update profile
router.post('/update-profile', async (req, res) => {
  const { 'org-name': orgName, 'contact-email': contactEmail, phone } = req.body;

  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login page if no user is logged in
  }

  try {
    // Update receiver's profile in database or session (Simulated here)
    const user = req.session.user;
    user.orgName = orgName;
    user.contactEmail = contactEmail;
    user.phone = phone;

    // You can update the database if necessary (e.g., using User.findByIdAndUpdate)
    // Example:
    // const updatedUser = await User.findByIdAndUpdate(user.id, { orgName, contactEmail, phone }, { new: true });

    // Update session with new data (in case the session is being used to persist user info)
    req.session.user = user;

    // Render the updated profile page
    res.render('Rprofile', {
      user,
      hideNavbar: true,
      noFooter: true
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile');
  }
});

  

const Order = require('../models/order');

// GET: Receiver Dashboard
router.get('/receiver-dashboard',restrictDashboardAccess,  async (req, res) => {
  try {
    const pickups = await Order.find({ status: 'Pending' });  // Ensure pickups is retrieved
    const history = await Order.find({ status: 'Completed' });
    
    const notifications = [
      { message: '🔔 New food donations available' },
      { message: '✅ You picked up an order yesterday' }
    ];
    
    const profile = req.session.user || {
      organization: 'N/A',
      email: 'N/A',
      phone: 'N/A'
    };
    

    res.render('receiver-dashboard',  { pickups,
       // Ensure pickups is always an array (even if empty)
      history,
      notifications,
      profile,
      user: req.session.user || {},  // Ensure the user is passed
      hideNavbar: true,
      noFooter: true,
      isReceiver: true // Pass the role to the template
    });

  } catch (err) {
    console.error('Error loading receiver dashboard:', err);
    res.status(500).send('Error loading receiver dashboard');
  }
});

router.get('/receiver-feedback', (req, res) => {
  res.render('receiver-feedback' , { noFooter:true ,hideNavbar:true}); // Replace with the correct view file
});


// POST route to handle feedback submission
/*router.post('/receiver-feedback', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    // Ensure that rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');
    }

    // Save the feedback to the database
    const newFeedback = new Feedback({ name, email, message, rating });
    await newFeedback.save();  // Save to database

    res.send('Feedback submitted successfully!');
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).send('Error submitting feedback');
  }
});*/
router.post('/receiver-feedback', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    // Ensure that rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).send('Rating must be between 1 and 5.');
    }

    // Save the feedback to the database
    const newFeedback = new Feedback({ name, email, message, rating });
    await newFeedback.save();  // Save to database

    // Send a notification for feedback submission
    const userId = req.session.user._id;  // Assuming `req.session.user._id` holds the receiver's ID
    await createNotification(userId, '💬', 'Thank you for submitting your feedback!');

    res.send('Feedback submitted successfully!');
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).send('Error submitting feedback');
  }
});




// Define the POST route to handle feedback submission
/*router.post('/receiver-feedback', async (req, res) => {
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




// POST: Receiver Confirms Pickup (Mark as Completed)
/*router.post('/receiver/orders/:id/confirm', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'Completed' });
    res.redirect('/receiver-dashboard');
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming the order');
  }
});*/
router.post('/receiver/orders/:id/confirm', async (req, res) => {
  try {
    // Mark the order as completed
    await Order.findByIdAndUpdate(req.params.id, { status: 'Completed' });

    // Send a notification to the user (receiver) for confirming the pickup
    const userId = req.session.user._id;  // Assuming `req.session.user._id` holds the receiver's ID
    await createNotification(userId, '✅', 'You have confirmed an order pickup.');

    // Redirect to the receiver dashboard
    res.redirect('/receiver-dashboard');
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming the order');
  }
});



/*router.get('/Rpickups', async (req, res) => {
  try {
    const pickups = await Pickup.find({ status: 'Pending' }).lean();
    res.render('Rpickup', { pickups , hideNavbar: true, noFooter: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching pickups');
  }
});*/
/*router.get('/Rpickups', async (req, res) => {
  try {
    const orders = await Donation.find().sort({ createdAt: -1 });
    res.render('Rpickup', {
      orders,
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Server Error');
  }
});*/

router.get('/Rpickups', async (req, res) => {
  try {
    const orders = await Donation.find().sort({ createdAt: -1 });

    // Notify the user when there are new donations available
    if (orders.length > 0) {
      const userId = req.session.user._id;  // Assuming `req.session.user._id` holds the receiver's ID
      await createNotification(userId, '🍞', 'New food donations are available for pickup!');
    }

    res.render('Rpickup', {
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
});*/
/*router.post('/:id/schedule', async (req, res) => {
  try {
    const { pickupTime } = req.body;
    await Donation.findByIdAndUpdate(req.params.id, {
      status: 'Scheduled',
      pickupTime: pickupTime ? new Date(pickupTime) : undefined
    });
    res.redirect('/Rpickups');
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
    res.redirect('/Rpickups');
  } catch (err) {
    console.error('Error confirming order:', err);
    res.status(500).send('Error confirming order');
  }
});*/




// Schedule an order
router.post('/:id/schedule', (req, res) => {
  orderController.scheduleOrder(req, res, '/Rpickups');
});

// Confirm an order (mark as completed)
router.post('/:id/confirm', (req, res) => {
  orderController.confirmOrder(req, res, '/Rpickups');
});

module.exports = router;




// GET: Pickup history for logged-in receiver
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
});*/

router.get('/Rhistory', async (req, res) => {
    try {
      const donations = await Donation.find().sort({ createdAt: -1 }).lean();

  
      /*const donationData = donations.map(d => ({
        date: d.createdAt.toLocaleDateString(),
        type: d.category || d.meal,
        quantity: d.quantity,
        expiry: d.expirationDate ? new Date(d.expirationDate).toLocaleDateString() : 'N/A',

        pickupTime: d.pickupTime ? new Date(d.pickupTime).toLocaleString() : 'Not set', // ✅ Include this
        status: d.status || 'Pending'
      }));*/
      const donationData = donations.map(d => {
        const status = d.status || 'Pending';
        const statusClass = `status-${status.toLowerCase()}`;
      
        return {
          date: d.createdAt.toLocaleDateString(),
          type: d.category || d.meal,
          quantity: d.quantity,
          expiry: d.expirationDate ? new Date(d.expirationDate).toLocaleDateString() : 'N/A',
          pickupTime: d.pickupTime ? new Date(d.pickupTime).toLocaleString() : 'Not set',
          status,
          statusClass
        };
      });
      
  
      res.render('Rhistory', {
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
  



  
  // GET Notifications Page
  router.get('/notifications', async (req, res) => {
    try {
      const userId = req.session.user._id;
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  
      res.render('notification', {
        notifications,
        user: req.session.user,
        hideNavbar: true,
        noFooter: true
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      res.status(500).send('Server Error');
    }
  });
  
  // POST Clear All Notifications
  // POST Clear All Notifications
router.post('/clear', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.session.user._id });
    res.redirect('/notifications');
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).send('Server Error');
  }
});

  
  module.exports = router;
  

