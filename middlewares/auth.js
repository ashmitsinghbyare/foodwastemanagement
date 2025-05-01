// In middlewares/auth.js or wherever you have the middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login'); // or send an error response
    }
  }
  
  module.exports = ensureAuthenticated; //
  