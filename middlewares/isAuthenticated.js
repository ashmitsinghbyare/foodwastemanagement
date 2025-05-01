// 1. Middleware for checking session-based authentication
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();  // User is authenticated, proceed to the next middleware/route
  }
  res.redirect('/login');  // If not authenticated, redirect to login
}

