// middleware/restrictToDonorIfLoggedIn.js
module.exports = function restrictToDonorIfLoggedIn(req, res, next) {
  const user = req.session.user;

  // If user is logged in and not a donor, block access
  if (user && user.role !== 'donor') {
    return res.status(403).send('Access denied: Donor access only');
  }

  // Otherwise (guest or donor), allow access
  next();
};
