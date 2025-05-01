module.exports = function restrictDashboardAccess(req, res, next) {
  const user = req.session?.user;

  // Allow guest access
  if (!user) {
    return next();
  }

  const role = user.role;
  const path = req.originalUrl || req.path;

  // Route-specific access control
  if (path.includes('/admin') && role !== 'admin') {
    return res.status(403).send('Access denied: Admins only');
  }

  if (path.includes('/receiver-dashboard') && role !== 'receiver') {
    return res.status(403).send('Access denied: Receivers only');
  }

  // Add other route-role checks here if needed

  next(); // ✅ Allow if all checks pass
};



