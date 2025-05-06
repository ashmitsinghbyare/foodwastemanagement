// server.js or app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB } = require('./config/database');

// Initialize express app
const app = express();

// Connect to MongoDB before starting the app
connectDB().then(() => {
  // Passport config
  require('./config/passport')(passport);

  // Body parser
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Method override
  app.use(methodOverride('_method'));

  // Static folder
  app.use(express.static(path.join(__dirname, 'public')));

  // EJS view engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Flash middleware
  app.use(flash());

  // Global variables
  app.use(async (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;

    if (req.user) {
      try {
        const { getUnreadCount } = require('./utils/notificationHelper');
        res.locals.unreadNotificationCount = await getUnreadCount(req.user._id);
      } catch (err) {
        console.error('Error fetching notification count:', err);
        res.locals.unreadNotificationCount = 0;
      }
    }

    next();
  });

  // Routes
  app.use('/', require('./routes/index'));
  app.use('/auth', require('./routes/auth'));
  app.use('/donor', require('./routes/donor'));
  app.use('/receiver', require('./routes/receiver'));
  app.use('/admin', require('./routes/admin'));
  app.use('/profile', require('./routes/profile'));
  app.use('/notifications', require('./routes/notifications'));
  app.use('/feedback', require('./routes/feedback'));

  // 404 Page
  app.use((req, res) => {
    res.status(404).render('404', {
      title: '404 - Page Not Found'
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', {
      title: '500 - Server Error',
      error: process.env.NODE_ENV === 'production' ? {} : err
    });
  });

  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Failed to start server due to DB connection error:', err);
});
