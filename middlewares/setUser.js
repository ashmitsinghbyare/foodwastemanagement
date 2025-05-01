module.exports = function setUser(req, res, next) {
    if (req.session && req.session.user) {
      req.user = req.session.user;
    }
    next();
  };
  