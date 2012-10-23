// Module dependencies
var mongoose = require('mongoose')
  , Db = require('mongodb').Db
  , Server = require('mongodb').Server
  , Schema = mongoose.schema;

// dependencies for authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user');

var db_data = {
  server: process.env.DB_SERVER || 'http://localhost',
  Server: null,
  port: process.env.DB_PORT || 27017,
  config: function() {
    if( !this.Server ) {
      this.Server = new Server(this.server, this.port, {auto_reconnect: true, native_parser: true});
    }
    return this.Server;
  },
  connection: null,
  connect: function( dbName ) {
    if( this.connection ) {
      return this.connection;
    }

    this.connection = new Db( dbName, this.config() );

    return this.connect();
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
  // initialize DB
  startup: function(dbToUse) {
    var db = db_data.connect( dbToUse );
    db.open(function(err, db) {
      if( !err ) {
        console.log("We are connected.");
      } else {
        console.log("Issue connecting to database.");
      }
    });

    return db;
  },

  data: db_data,

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
