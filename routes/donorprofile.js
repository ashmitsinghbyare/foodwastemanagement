const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const donor = require('../models/donor');



// Define the multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Path where files are stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique name
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage });


// Route to render the user profile page
/*router.get('/Rprofile', async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.session.userId) return res.redirect('/login'); // Redirect to login if no session ID exists
    
    // Retrieve user data from session
    const user = req.session.user;

    if (!user) return res.status(404).send('User not found');
    
    // Render profile page with user data
    res.render('Rprofile', { user, hideNavbar: true, noFooter: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});*/

router.get('/Rprofile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');  // Redirect to login if no session user is found
    }

      // Get user from the session

    // Render profile page with user data
    res.render('Rprofile', {
      user: req.user,  // Pass user to the template
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Error loading profile');
  }
});



// Route to render the edit profile form
router.get('/Redit-profile', async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.session.userId) return res.redirect('/login'); // Redirect to login if no session ID exists
    
    // Retrieve user data from database using session ID
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send('User not found');
    
    // Render edit profile form with user data
    res.render('ReditProfile', { user, hideNavbar: true, noFooter: true });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

/*router.post('/Redit-profile', upload.single('profileImage'), async (req, res) => {
  console.log('File uploaded:', req.file); // Log the uploaded file details

  const { firstName, lastName, gender } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
  
  
  
  
    console.log('Received Form Data:', req.body);  // Log the data received
  
    try {
      if (!req.session.userId) return res.redirect('/login'); // Ensure the user is logged in
  
      // Prepare data to be updated
      const updatedData = {
        firstName,
        lastName,
        gender,
        
      }
      if (profileImage) {
        updatedData.profileImage = profileImage;
      }
  
      const updatedUser = await User.findByIdAndUpdate(req.session.userId, updatedData, { new: true });
      console.log("Updated User:", updatedUser); // Log the updated user data
  
      if (!updatedUser) {
        console.error('User not found or could not be updated');
        return res.status(404).send('User not found');
      }
  
      // Update the session with the new user data
      req.session.user = {
        id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage || '/uploads/default-avatar.jpg',
       
        gender: updatedUser.gender,
      };
  
      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).send('Session update error');
        }
  
        // After saving the session, redirect the user to the updated profile page
        res.redirect('/Rprofile');
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Error updating profile');
    }
  });*/
  router.post('/Redit-profile', upload.single('profileImage'), async (req, res) => {
    const { firstName, lastName, gender } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
  
    try {
      // Use req.session.userId to access the correct user
      const updatedUser = await User.findByIdAndUpdate(
        req.session.userId,  // Use session userId
        { 
          firstName, 
          lastName, 
          gender, 
          profileImage: profileImage || req.user.profileImage  // Use the existing image if no new one
        },
        { new: true } // Return the updated document
      );
  
      // Update session data with the new user details
      req.session.user = {
        id: updatedUser._id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage || 'https://i.pravatar.cc/150?img=1', // fallback profile image
      };
  
      // Redirect to the profile page
      res.redirect('/Rprofile');  // Adjust the URL to match your actual profile page route
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Error updating profile.');
    }
  });

 /* const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Define the multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Path where files are stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique name
  }
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Route to render the user profile page
router.get('/Rprofile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');  // Redirect to login if no session user is found
    }

    // Render profile page with user data from session
    res.render('Rprofile', {
      user: req.session.user,  // Pass user to the template
      hideNavbar: true,
      noFooter: true
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Error loading profile');
  }
});

// Route to render the edit profile form
router.get('/Redit-profile', async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.session.user) return res.redirect('/login'); // Redirect to login if no session user

    // Render edit profile form with user data from session
    res.render('ReditProfile', { user: req.session.user, hideNavbar: true, noFooter: true });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

// Route to handle the profile update
router.post('/Redit-profile', upload.single('profileImage'), async (req, res) => {
  const { firstName, lastName, gender } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Use session userId for updating the correct user
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,  // Use session user ID
      {
        firstName,
        lastName,
        gender,
        profileImage: profileImage || req.session.user.profileImage  // Fallback to existing image
      },
      { new: true } // Return the updated document
    );

    // If no user was found or updated, return error
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }

    // Update session data with the new user details
    req.session.user = {
      id: updatedUser._id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage || req.session.user.profileImage,  // Keep the profile image consistent
    };

    // Redirect to the profile page
    res.redirect('/Rprofile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile.');
  }
});*/

module.exports = router;


