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

const http = require('http');
const socketIo = require('socket.io');
const helpRoutes = require('./routes/helpRoutes');
const Pickup = require('./models/Pickup');
const Donation = require('./models/donation');
const restrictToDonor = require('./middlewares/restrictDonorAccess');

const User = require('./models/User');  // Added the missing import for User model

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors()); // Enable CORS for all routes
require('dotenv').config();
const server = http.createServer(app);
const io = socketIo(server);

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
app.use(express.static('public'));

// Session setup using MongoStore
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/foodwastemanagement' }),
}));

// === MongoDB Setup ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));





// Session middleware to load user data into session
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();  // Fetch user from DB
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

// === Routes ===
const availabilityRoute = require('./routes/availability');
const contactRoutes = require('./routes/contactRoutes'); 
const profileRoutes = require('./routes/profileRoutes');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');
const donorProfileRoutes = require('./routes/donorprofile');
const donationRoutes = require('./routes/donations');
const donationHistoryRoutes = require('./routes/history');
const pickupRoute = require('./routes/pickups');
const statsRoutes = require('./routes/stats');
const loadUser = require('./middlewares/loadUser');
app.use(loadUser);
const receiver = require('./routes/receiver');
app.use('/' , receiver);
const accountRoutes = require('./routes/account'); // Added account routes
app.use('/account', accountRoutes); // Use the account routes
// Register routes
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

// Other routes
const orderRoute = require('./routes/orders');
app.use('/orders', orderRoute);
const donorRoute = require('./routes/dprofile');
app.use('/', donorRoute);

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

// === Logout Route ===
app.get('/logout', (req, res) => {
  const username = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/?loggedOut=true&username=' + encodeURIComponent(username));
  });
});

// === Dashboard Route ===
/*app.get('/dashboard',restrictToDonor, (req, res) => {
  console.log("SESSION:", req.session);
  const user = req.user || req.session.user;

  if (!user) {
    return res.redirect('/login');
  }

  res.render('donor-dashboard', {
    user,
    title: `${user.name || 'Donor'}'s Dashboard`,
    user,
    isDonor: user.role === 'donor',
    hideNavbar: true,
    noFooter: true
  });
});*/
const donorRoutes = require('./routes/donor'); // adjust path if needed

// Assuming passport or session sets req.user
app.use('/', donorRoutes);



/*app.get('/dashboard', (req, res) => {
  const user = req.user || {};

  res.render('donor-dashboard', {
    title: `${user.name}'s Dashboard`,
    user,
    isDonor: true,
    isAdmin: false,
    isAnalytics: false,
    hideNavbar: true,
    noFooter: true
  });
});*/

// === Profile Image Upload ===
app.post('/edit-profile', upload, async (req, res) => {
  const { firstName, lastName, gender } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId,
      { 
        firstName, 
        lastName, 
        gender, 
        profileImage: profileImage || req.user.profileImage
      },
      { new: true }
    );

    req.session.user = {
      id: updatedUser._id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage || 'https://i.pravatar.cc/150?img=1',
    };

    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile.');
  }
});

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


// === Food Donation Form ===
app.get('/food-donate', (req, res) => {
const user = req.user || req.session.user; // Use session user if available

  const dynamicData = {
    user,
    title: 'Food Donation Form',
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

  res.render('food-donate', dynamicData );
});

// === Schedule Pickup ===
app.get('/schedule', async (req, res) => {
  try {
    const pickups = await Pickup.find({ donor: req.session.donorId, status: 'Scheduled' }).sort({ pickupTime: 1 });
    res.render('schedule', { pickups, hideNavbar: true, noFooter: true });
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
});

// === Schedule Pickup POST ===
app.post('/schedule-pickup', async (req, res) => {
  try {
    const { pickupTime, status, donationDetails } = req.body;
    const donorId = req.user._id;

    const newPickup = new Pickup({
      donorId,
      pickupTime,
      status: 'Scheduled',
      donationDetails,
    });

    await newPickup.save();
    res.status(201).json({ message: 'Pickup scheduled successfully!' });
  } catch (err) {
    console.error('Error scheduling pickup:', err);
    res.status(500).json({ message: 'Failed to schedule pickup' });
  }
});

// === Create a Donation ===
app.post('/donation', async (req, res) => {
  const {
    foodname, meal, category, quantity, amount, expiry,
    name, phoneno, phone, district, location, address, donorId
  } = req.body;

  try {
    const newDonation = new Donation({
      foodname, meal, category, quantity, amount, expiry,
      name, phoneno, phone, district, location, address, donorId,
      status: 'Pending',
      expirationDate: new Date(expiry),
    });

    await newDonation.save();
    res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: 'Error creating donation', error });
  }
});

// === Start Server ===
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
