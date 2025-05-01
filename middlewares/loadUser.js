const User = require('../models/User');

async function loadUser(req, res, next) {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();
      req.user = user || null;
    } catch (err) {
      console.error('Error loading user:', err);
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = loadUser;
