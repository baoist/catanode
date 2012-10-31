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
  db: null,
  connection: function( dbToUse ) {
    var db = "";
    if( typeof dbToUse !== "undefined" ) {
      db = "/" + dbToUse;
    }

    return this.db = this.server + ":" + this.port + db;
  }
}

// Define local strategy for Passport
passport.use(new LocalStrategy({
    usernameField: 'user[username]',
    passwordField: 'user[password]'
  }, function(username, password, done) {
    User.authenticate(username, password, function(err, user) {
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
  data: db_data,

  startup: function(dbToUse) {
    mongoose.connect(db_data.connection( dbToUse ), function( err ) {
      if( err ) {
        console.log( err );
      }
    });

    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    });

    return this;
  },

  User: User,

  saveUser: function(userInfo, callback) {
    User.find().or([{ username: userInfo.username }, { email: userInfo.email }]).exec(function(err, users) {
      if( !users || users.length < 1 ) {
        var newUser = new User({
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

  userByUsername: function(identification, callback) {
    User.findOne({username: identification}, function(err, user) {
      callback(err, user);
    });
  }
}
