// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // assuming passwords are hashed
const crypto = require('crypto');
const Feedback = require('../models/Feedback');
const Donation = require('../models/donation');

const path = require('path');




router.get('/login', (req, res) => {
  const error = req.session.error;
  req.session.error = null;
  res.render('login', { error: null, success: null, noFooter: true, hideNavbar: true });
});


// POST login form

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find the user by email and role
    const user = await User.findOne({ email, role });

    // If user is not found or role mismatch
    if (!user) {
      return res.render('login', {
        error: 'User not found or role mismatch.',
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }

    // Compare the password with the hashed one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        error: 'Invalid credentials.',
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }
    req.session.userId = user._id;
    // Save user session data
    req.session.user = {

      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      image: user.profileImage || '/uploads/default-avatar.jpg', // Correct fallback
    };

    // Store user ID in session
    console.log('🔍 Session user:', req.session.user);


    req.session.save(async (err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('login', {
          error: 'Session save error. Please try again.',
          success: null,
          noFooter: true,
          hideNavbar: true,
        });
      }

      // Redirect based on user role
      if (user.role === 'admin') {
        try {
          const page = parseInt(req.query.page) || 1;
          const totalUsers = await User.countDocuments();
          const totalFeedbacks = await Feedback.countDocuments();
          const totalDonations = await Donation.countDocuments();
          const limit = 5; // Donations per page
          const recentDonations = await Donation.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(5)
            .populate('donorId', 'firstName lastName'); // if you want donor name

          // Optional: Format donations if you want names directly in EJS
          const formattedDonations = recentDonations.map(donation => ({
            donorName: donation.donorId ? `${donation.donorId.firstName} ${donation.donorId.lastName}` : 'Unknown',
            foodName: donation.foodName || 'N/A',
            amount: donation.amount,
            createdAt: donation.createdAt
          }));
          const totalPages = Math.ceil(totalDonations / limit);
          return res.render('admin/dashboard', {
            user,
            totalPages,
            currentPage: page,
            totalUsers,
            totalFeedbacks,
            totalDonations,
            recentDonations: formattedDonations,
            hideNavbar: true,
            noFooter: true,
          });
        } catch (err) {
          console.error('Error fetching counts:', err);
          return res.status(500).send('Failed to load dashboard data');
        }
      } else if (user.role === 'receiver') {
        return res.render('receiver-dashboard', {
          user: req.session.user,

          hideNavbar: true,
          noFooter: true,
        });
      } else if (user.role === 'donor') {
        return res.render('donor-dashboard', {
          hideNavbar: true,
          noFooter: true,
        });
      } else {
        return res.render('/');
      }
    });
  } catch (err) {
    console.error(err);
    return res.render('login', {
      error: 'Server error. Please try again later.',
      success: null,
      noFooter: true,
      hideNavbar: true,
    });
  }
});
/*router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find the user by email and role
    const user = await User.findOne({ email, role });

    // If user is not found or role mismatch
    if (!user) {
      return res.render('login', {
        error: 'User not found or role mismatch.',
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }

    // Compare the password with the hashed one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        error: 'Invalid credentials.',
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }

    // Save user session data
    req.session.user = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      image: user.profileImage || '/uploads/default-avatar.jpg', // Correct fallback
    };

    req.session.userId = user._id; // Store user ID in session

    // Save session data
    req.session.save(async (err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('login', {
          error: 'Session save error. Please try again.',
          success: null,
          noFooter: true,
          hideNavbar: true,
        });
      }

      // Redirect based on user role
     /* if (user.role === 'admin') {
        try {
          const totalUsers = await User.countDocuments();
          const totalFeedbacks = await Feedback.countDocuments();
          const totalDonations = await Donation.countDocuments();

          const recentDonations = await Donation.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(5)
            .populate('donorId', 'firstName lastName'); // if you want donor name

          const formattedDonations = recentDonations.map(donation => ({
            donorName: donation.donorId ? `${donation.donorId.firstName} ${donation.donorId.lastName}` : 'Unknown',
            foodName: donation.foodName || 'N/A',
            amount: donation.amount,
            createdAt: donation.createdAt
          }));

          return res.render('admin/dashboard', {
            user,  // Pass user data
            totalUsers,
            totalFeedbacks,
            totalDonations,
            recentDonations: formattedDonations,
            hideNavbar: true,
            noFooter: true,
          });
        } catch (err) {
          console.error('Error fetching counts:', err);
          return res.status(500).send('Failed to load dashboard data');
        }
      } else if (user.role === 'donor') {
        return res.render('donor-dashboard', {
          user,  // Ensure the user data is passed
          hideNavbar: true,
          noFooter: true,
        });
      } else if (user.role === 'receiver') {
        return res.render('receiver-dashboard', {
          user,  // Ensure the user data is passed
          hideNavbar: true,
          noFooter: true,
        });
      } else {
        return res.redirect('/');  // Redirect to home page if no role matches
      }
    });

    req.session.save(async (err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('login', {
          error: 'Session save error. Please try again.',
          success: null,
          noFooter: true,
          hideNavbar: true,
        });
      }
    
      // ✅ Redirect based on user role
      if (user.role === 'admin') {
        try {
          const totalUsers = await User.countDocuments();
          const totalFeedbacks = await Feedback.countDocuments();
          const totalDonations = await Donation.countDocuments();
    
          const recentDonations = await Donation.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('donorId', 'firstName lastName');
    
          const formattedDonations = recentDonations.map(donation => ({
            donorName: donation.donorId ? `${donation.donorId.firstName} ${donation.donorId.lastName}` : 'Unknown',
            foodName: donation.foodName || 'N/A',
            amount: donation.amount,
            createdAt: donation.createdAt
          }));
    
          return res.render('admin/dashboard', {
            user,
            totalUsers,
            totalFeedbacks,
            totalDonations,
            recentDonations: formattedDonations,
            hideNavbar: true,
            noFooter: true,
          });
        } catch (err) {
          console.error('Error fetching counts:', err);
          return res.status(500).send('Failed to load dashboard data');
        }
    
      } else if (user.role === 'donor') {
        // ✅ Just redirect - session middleware will handle loading user data
        return res.redirect('/dashboard');
      } else if (user.role === 'receiver') {
        return res.redirect('/receiver-dashboard'); // or another path
      } else {
        return res.redirect('/');
      }
    });
    
  } catch (err) {
    console.error(err);
    return res.render('login', {
      error: 'Server error. Please try again later.',
      success: null,
      noFooter: true,
      hideNavbar: true,
    });
  }
});*/

/*router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.render('login', {
        error: 'User not found or role mismatch.',
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        error: 'Invalid credentials.',
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }

    req.session.user = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      image: user.profileImage || '/uploads/default-avatar.jpg',
    };
    req.session.userId = user._id;

    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('login', {
          error: 'Session save error. Please try again.',
          success: null,
          noFooter: true,
          hideNavbar: true,
        });
      }

      if (user.role === 'admin') {
        (async () => {
          try {
            const totalUsers = await User.countDocuments();
            const totalFeedbacks = await Feedback.countDocuments();
            const totalDonations = await Donation.countDocuments();

            const recentDonations = await Donation.find()
              .sort({ createdAt: -1 })
              .limit(5)
              .populate('donorId', 'firstName lastName');

            const formattedDonations = recentDonations.map(donation => ({
              donorName: donation.donorId ? `${donation.donorId.firstName} ${donation.donorId.lastName}` : 'Unknown',
              foodName: donation.foodName || 'N/A',
              amount: donation.amount,
              createdAt: donation.createdAt
            }));

            return res.render('admin/dashboard', {
              user,
              totalUsers,
              totalFeedbacks,
              totalDonations,
              recentDonations: formattedDonations,
              hideNavbar: true,
              noFooter: true,
            });
          } catch (err) {
            console.error('Error fetching dashboard data:', err);
            return res.status(500).send('Failed to load dashboard data');
          }
        })();
      } else if (user.role === 'donor') {
        return res.redirect('/dashboard');
      } else if (user.role === 'receiver') {
        return res.redirect('/receiver-dashboard');
      } else {
        return res.redirect('/');
      }
    });

  } catch (err) {
    console.error(err);
    return res.render('login', {
      error: 'Server error. Please try again later.',
      success: null,
      noFooter: true,
      hideNavbar: true,
    });
  }
});*/


// Render signup page
// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup', {
    error: null,
    success: null,
    noFooter: true,
    hideNavbar: true
  });

});

// Handle signup form submission
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if all required fields are filled
  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      error: 'Please fill in all fields.'
    });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'Email is already in use.'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,

    });

    await user.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong.'
    });
  }
});






// Recovery Route
router.get('/recovery', (req, res) => {
  res.render('recovery', { hideNavbar: true, noFooter: true });
});




router.post('/recover', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send('No user found with that email');
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // ✅ Add this line right here:
    const resetLink = `http://localhost:3000/reset/${token}`;
    console.log(`Reset link: ${resetLink}`);

    // TODO: Send email with token link (you can use nodemailer)
    res.send('A password reset link has been sent to your email.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/reset/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.send('Invalid or expired token');
    }

    // Render reset form and pass the token
    res.render('reset', { token, hideNavbar: true, noFooter: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.send('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    //res.send('Password has been reset successfully. You can now <a href="/login">login</a>.');
    res.redirect('/login');

  } catch (err) {
    console.error(err);
    res.status(500).send('Error resetting password');
  }
});



module.exports = router;
