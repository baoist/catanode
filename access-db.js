// Module dependencies
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// dependencies for authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user');

// Define local strategy for Passport
passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    User.authenticate(email, password, function(err, user) {
      return done(err, user);
    });
  }
));
      
// serialize user on login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize user on logout
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = {
  // initialize DB
  startup: function(dbToUse) {
    mongoose.connect(dbToUse);
    // Check connection to mongoDB
    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    }); 
  },

  saveUser: function(userInfo, callback) {
    var newUser = new User ({
      name: { first: userInfo.fname, last: userInfo.lname },
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password
    });

    newUser.save(function(err) {
      if (err) {throw err;}
      callback(null, userInfo);
    });
  },

  getUsers: function(callback) {
    User.find({}, function(err, users) {
      callback(users);
    });
  },
}
