module.exports = {
  // Ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/auth/login');
  },
  
  // Allow only donors to access
  ensureDonor: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'donor') {
      return next();
    }
    req.flash('error_msg', 'Access denied. This area is for donors only');
    res.redirect('/dashboard');
  },
  
  // Allow only receivers to access
  ensureReceiver: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'receiver') {
      return next();
    }
    req.flash('error_msg', 'Access denied. This area is for receivers only');
    res.redirect('/dashboard');
  },
  
  // Allow only admins to access
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'Access denied. This area is for administrators only');
    res.redirect('/dashboard');
  },
  
  // Check if user is not logged in (for auth pages)
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  }
};
