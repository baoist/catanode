var assert = require("assert");

describe('Connection', function() {
  var Db = require('../access-db')
    , db = new Db.startup( 'catanode-users-test' );

  before(function() {
    // Clear the database
    Db.User.remove({}, function(err) { 
      console.log('Removed all users.');
    });
  });

  describe("#saveUser()", function() {
    it('should create a new user', function(done) {
      Db.saveUser({
        fname: "b-rad", lname: "olson",
        email: "foo@brad.io",
        username: "bao!",
        password: "wibblez"
      }, function(err, user) {
        if( err ) throw err;
        done();
      });
    });
  });

  describe("#getUsers()", function() {
    it('should return all users, with a length of 1', function(done) {
      Db.getUsers(function(users) {
        if( users.length > 0 ) {
          done();
        }
      });
    });
  });
});
