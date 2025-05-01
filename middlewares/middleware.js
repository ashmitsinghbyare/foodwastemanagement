function checkRole(requiredRole) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== requiredRole) {
      // Redirect to login with an alert message
      return res.render('login', {
        error: `Access denied. Please log in as a ${requiredRole} to view this page or continue as a guest.`,
        success: null,
        noFooter: true,
        hideNavbar: true,
      });
    }
    next(); // User has correct role
  };
}

module.exports = { checkRole };
