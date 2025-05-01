const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const fs = require('fs');
const upload = require('./middlewares/multer'); 
const { checkRole } = require('./middlewares/middleware');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helpRoutes = require('./routes/helpRoutes');

const Pickup = require('./models/pickup');
//const { ensureAuthenticated } = require('./middlewares/isAuthenticated');
const Donation = require('./models/donation');

const restrictDonorAccess = require('./middlewares/restrictDonorAccess'); 


const app = express();
const port = 3000;

const server = http.createServer(app);
const io = socketIo(server);
//const passport = require('passport');

// === Middleware ===
app.use('/uploads', express.static('public/uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // ✅ Serve static files
//app.use(cors());
//require('./config/passport')(passport);

app.use(session({
  secret: 'your-secret-key', // Change this to a more secure secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/foodwastemanagement' }),
  // For development (set `secure: true` in production if using HTTPS)
}));



// === MongoDB Setup ===
mongoose.connect('mongodb://localhost:27017/foodwastemanagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.log('MongoDB connection error:', err);
});



app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId).lean();

      req.user = user;
      res.locals.user = user;
    } catch (err) {
      console.error('Error loading user from session:', err);
      req.user = null;
      res.locals.user = null;
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});


// === Mock Authentication Middleware (for testing only) ===
// Replace with real authentication in production
/*app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.user = req.user; // optional for EJS use
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});*/
/*app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.user = req.user;
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
});*/




// === Routes ===
const availabilityRoute = require('./routes/availability');

const contactRoutes = require('./routes/contactRoutes'); 
const profileRoutes = require('./routes/profileRoutes');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback'); // Adjust path
const donorProfileRoutes = require('./routes/donorprofile');
const donationRoutes = require('./routes/donations');
const donationHistoryRoutes = require('./routes/history');
const pickupRoute = require('./routes/pickups');
const statsRoutes = require('./routes/stats'); 
const loadUser = require('./middlewares/loadUser');
app.use(loadUser);

app.use('/', donationHistoryRoutes);
app.use('/api/pickups', pickupRoute);

app.use('/api/help', helpRoutes);
app.use('/', feedbackRoutes);
app.use('/', donorProfileRoutes);
app.use('/', statsRoutes);
app.use('/', contactRoutes);
app.use('/', donationRoutes);
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', profileRoutes);
app.use('/', availabilityRoute);
const orderRoute = require('./routes/orders');
app.use('/orders', orderRoute);
const donorRoute = require('./routes/dprofile');
app.use('/', donorRoute); 

// Live chat socket connection
/*io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('send-message', (message) => {
    console.log('Message from user:', message);
    // Emit the message to all connected clients (or you can direct it to a specific user)
    io.emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});*/



// === /admin/subscribers ===
app.get('/admin/subscribers', (req, res) => {
  const filePath = path.join(__dirname, 'subscribers.txt');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Unable to read subscribers list.');
    }

    const emails = data.split('\n').filter(email => email.trim() !== '');
    res.render('subscribers', { emails });
  });
});

// === /subscribe ===
app.post('/subscribe', (req, res) => {
  const email = req.body.email;
  console.log(`New subscription: ${email}`);

  const filePath = path.join(__dirname, 'subscribers.txt');

  fs.appendFile(filePath, email + '\n', err => {
    if (err) {
      console.error('Failed to save email:', err);
      return res.status(500).send('Something went wrong!');
    }

    res.send(`
      <h1>Thank you for subscribing, ${email}!</h1>
      <a href="/">Go Back</a>
    `);
  });
});

// === Static Pages ===
app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { hideNavbar: true });
});

app.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', { hideNavbar: true });
});

app.get('/faqs', (req, res) => {
  res.render('faqs', { hideNavbar: true });
});




/*app.get('/dashboard', (req, res) => {
  console.log("SESSION:", req.session);
  console.log("User in dashboard route:", req.session.user);


  const user = req.session.user || req.user;

  console.log("User in dashboard route:", user);

  res.render('donor-dashboard', {
    title: `${user.name || 'Donor'}'s Dashboard`,
    user: req.session.user,
    isDonor: true,
    isAdmin: false,
    isAnalytics: false,
    hideNavbar: true,
    noFooter: true
  });
});
*/

app.get('/dashboard', (req, res) => {
  console.log("SESSION:", req.session);
  console.log("User in dashboard route:", req.session.user);

  // Prefer req.user from middleware, fallback to session.user if available
  const user = req.user || req.session.user;

  if (!user) {
    // Handle guest or unauthorized access
    return res.redirect('/login'); // Or show a guest-friendly page
  }

  console.log("Final user in dashboard:", user);

  res.render('donor-dashboard', {
    title: `${user.name || 'Donor'}'s Dashboard`,
    user,
    isDonor: user.role === 'donor',
    isAdmin: user.role === 'admin',
    isAnalytics: user.role === 'analytics',
    hideNavbar: true,
    noFooter: true
  });
});



app.get('/upload-profile', (req, res) => {
  res.redirect('/profile');
});


// === Profile Image Upload ===
// Add User model if you have one:
// const User = require('./models/User');


app.post('/edit-profile', upload, async (req, res) => {
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
    res.redirect('/profile');  // Adjust the URL to match your actual profile page route
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile.');
  }
});
app.get('/food-donate', (req, res) => {
  const user = req.user;

  const dynamicData = {
    foodname: '',
    meal: 'veg',
    category: 'cooked-food',
    quantity: '',
    name: '',
    phoneno: '',
    selectedDistrict: 'Indore',
    address: '',
    pincode: '', // Set a default empty string for pincode
    hideNavbar: true,
    noFooter: true,
    donorId: user?._id // ✅ Using _id as donorId
  };

  res.render('food-donate', dynamicData);
});






/*app.get('/logout', (req, res) => {
  //const username = req.session.username; // Save username before destroying session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }

    // Pass the username and success message to the home page
    res.render('pages/home')
  });
});*/
app.get('/logout', (req, res) => {
  const username = req.session.username;

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }

    // Redirect to home with query or flash message
    res.redirect('/?loggedOut=true&username=' + encodeURIComponent(username));
  });
});




// app.js or routes.js (where your route is defined)
app.get('/schedule',  async (req, res) => {
  try {
    // Get the scheduled pickups for the logged-in user (assuming user is a donor)
    const pickups = await Pickup.find({ donorId: req.user._id, status: 'Scheduled' }).sort({ pickupTime: 1 });
    
    // Render the schedule.ejs page with the pickups data
    res.render('schedule', { pickups , hideNavbar:true, noFooter:true});  // Pass pickups data to the view
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
});

app.post('/schedule-pickup',  async (req, res) => {
  try {
    const { pickupTime, status, donationDetails } = req.body;
    const donorId = req.user._id; // Get the donor's ID from the authenticated user

    const newPickup = new Pickup({
      donorId,
      pickupTime,
      status: 'Scheduled', // Initially, the status is 'Scheduled'
      donationDetails, // Details of the donation, such as type, quantity, etc.
    });

    await newPickup.save();
    res.status(201).json({ message: 'Pickup scheduled successfully!' });
  } catch (err) {
    console.error('Error scheduling pickup:', err);
    res.status(500).json({ message: 'Failed to schedule pickup' });
  }
});




/*app.get('/stats', (req, res) => {
  const userType = 'Donor'; // Replace with dynamic value, possibly from session or database
  res.render('stats', {
    userType: userType,
    hideNavbar: true, // Show navbar
  });
});*/

// Example route to create a new donation
app.post('/donation', async (req, res) => {
  const {
    foodname, meal, category, quantity, amount, expiry,
    name, phoneno, phone, district, location, address, donorId
  } = req.body;

  try {
    const newDonation = new Donation({
      foodname, meal, category, quantity, amount, expiry,
      name, phoneno, phone, district, location, address, donorId,
      status: 'Pending',  // Default status
      expirationDate: new Date(expiry), // Assuming `expiry` is a date string
    });

    await newDonation.save();
    res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: 'Error creating donation', error });
  }
});
// Example route to get donations by donorId
app.get('/donations/:donorId', async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.params.donorId });
    res.json({ donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Error fetching donations', error });
  }
});


/*app.get('/availability', (req, res) => {
  const userType =
    'Donor'; // You can get the user's type from the session or database


  res.render('availability', {
    userType: userType,
    availableItems: '5 kg',
    nextPickup: 'Tomorrow, 3 PM',
    status: 'Available',
    hideNavbar: true, // Show navbar
  });
});*/






const receiverRoutes = require('./routes/receiver');
app.use('/', receiverRoutes);

const settingsRoute = require('./routes/settings');
app.use('/', settingsRoute);




const accountRoutes = require('./routes/account');
app.use('/account', accountRoutes);




// === Start Server ===
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
