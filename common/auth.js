const log = require('@common/log');
const passport = require('passport');
const Iron = require('iron');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../features/users/user.model');
const config = require('@config');
const verify = require('@common/verify');
const Q = require('q');

// Setup Local Login Strategy
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getLoginData = function (user, expiry) {
  const userData = {
    firstname: user._doc.firstname,
    lastname: user._doc.lastname,
    username: user._doc.username,
    admin: user._doc.admin,
    _id: user._doc._id
  };

  const deferred = Q.defer();
  Iron.seal(userData, config.sealPass, Iron.defaults, function (err, sealed) {
    if (err) {
      deferred.reject(err);
    }
    log(sealed);
    log(err);
    const token = verify.getToken({ data: sealed }, expiry || `30 days`);
    const data = {
      token: token,
      user: userData
    };
    deferred.resolve(data);
  });

  return deferred.promise;
};
