const passport = require('passport');
module.exports = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error || !user) {
      console.log(error, user);
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};
