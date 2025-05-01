const express = require('express');
const router = express.Router();
const session = require('express-session');
const Category = require('../models/Category'); // Ensure Category model is imported
const Article = require('../models/Articles');

router.use(session({
  secret: 'yourSecretKeyHere', // change this to a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set true only if using HTTPS
}));



// Middleware to pass user to all EJS views
router.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.activePage = ''; // Optional: default activePage
  next();
});


/*router.get('/', (req, res) => {
  // Render the 'home' page with the user session
  res.render('pages/home', { user: req.session.user });
});*/

router.get('/', (req, res) => {
  const loggedOut = req.query.loggedOut === 'true';
  const username = req.query.username || null;
  const darkMode = req.session.darkMode || false;

  res.render('pages/home', { loggedOut, username  , darkMode });
});

router.get('/profile', (req, res) => res.render('pages/home', { user:req.session.user })); 
router.get('/setting', (req, res) => res.render('pages/setting', { user:req.session.user }));
router.get('/addaccount', (req, res) => res.render('pages/addaccount', { user:req.session.user }));

// Route for About page


// Route for Home page
router.get('/home', (req, res) => {
  res.render('pages/home', {
    title: 'Home',
    navbar: 'default',
    activePage: 'home',  // Ensure activePage is defined here
  });
});

// Route for Contact page
// Route to render the contact page
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us',
    navbar: 'contact',         // Used for active nav highlighting (can be removed if not used)
    activePage: 'contact',     // Also used for highlighting or conditional rendering
    hideNavbar: true,          // ✅ Hide navbar
    noFooter: true,            // ✅ Hide footer
    successMessage: null, // ✅ Add this
    errorMessage: null,           // Optional: placeholder for error messages
  });
});

router.get('/help', (req, res) => {
  const user = req.user || null;  // Assuming you're using a session or authentication
  
  // Fetch categories and populate the 'articles' field with associated articles
  Category.find()
    .populate('articles')  // Populate the articles field with Article documents
    .then(categories => {
      // Render the help page with categories and their articles
      res.render('pages/help', { 
        title: "Help Center", 
        categories, 
        user, 
        hideNavbar: true ,
        noFooter: true, // Hide footer if needed
      });
    })
    .catch(err => {
      console.error('Error fetching categories:', err);
      res.status(500).send('Error fetching data');
    });
});




router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Us',
    navbar: 'about',  // This tells layout.ejs to use navbar-about.ejs
    activePage: 'about',
    hideNavbar:true,
    noFooter:true  // This ensures 'about' is set as active in navbar
  });
});



/*const express = require('express');
const router = express.Router();
const session = require('express-session');
const Category = require('../models/Category');
const Article = require('../models/Articles');

router.use(session({
  secret: 'yourSecretKeyHere',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }  // Secure cookies in production
}));

// Middleware to pass user and defaults to all views
router.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.activePage = '';
  res.locals.hideNavbar = true;
  res.locals.noFooter = true;
  next();
});

// Home Page Route
router.get('/', (req, res) => {
  const loggedOut = req.query.loggedOut === 'true';
  const username = req.query.username || null;
  const darkMode = req.session.darkMode || false;
  res.render('pages/home', { loggedOut, username, darkMode });
});

// Profile Route
router.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('pages/profile', { user: req.session.user });
});

// Settings Route
router.get('/setting', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('pages/setting', { user: req.session.user });
});

// Help Route with Categories and Articles
router.get('/help', (req, res) => {
  Category.find()
    .populate('articles')
    .then(categories => {
      res.render('pages/help', { 
        title: "Help Center", 
        categories, 
        user: req.session.user, 
        hideNavbar: true, 
        noFooter: true
      });
    })
    .catch(err => {
      console.error('Error fetching categories:', err);
      res.status(500).send('Error fetching data');
    });
});

// Contact Page
router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us',
    navbar: 'contact',
    activePage: 'contact',
    hideNavbar: true,
    noFooter: true,
    successMessage: null,
    errorMessage: null
  });
});

// About Page
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Us',
    navbar: 'about',
    activePage: 'about',
    hideNavbar: true,
    noFooter: true
  });
});
*/
module.exports = router;



