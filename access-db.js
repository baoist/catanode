// Module dependencies
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// dependencies for authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user');

var db_data = {
  server: process.env.DB_SERVER || 'mongodb://localhost',
  port: process.env.DB_PORT || 27017,
  connection: function() {
    return this.server + ":" + this.port;
  }
}

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

    return this;
  },

  data: db_data,

  User: User,

  saveUser: function(userInfo, callback) {
    User.find().or([{ username: userInfo.username }, { email: userInfo.email }]).exec(function(err, users) {
      if( !users || users.length < 1 ) {
        var newUser = new User ({
          name: { first: userInfo.fname, last: userInfo.lname },
          username: userInfo.username,
          email: userInfo.email,
          password: userInfo.password
        });

        newUser.save(function(err) {
          if (err) { throw err; }

          if( typeof callback !== "undefined" ) {
            callback(null, userInfo);
          }
        });
      } else {
        if( typeof callback !== "undefined" ) {
          callback("Users exist where expected, given the username\"" + userInfo.username + "\" and the email \"" + userInfo.email + "\"", null);
        }
      }
    });
  },

  getUsers: function(callback) {
    User.find({}, function(err, users) {
      callback(users);
    });
  },
}
