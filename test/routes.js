var Browser = require("zombie")
  assert = require("assert");

var browser = new Browser()
  , base_url = "http://localhost:8080";

describe('Routes', function() {
  var Db = require('../access-db')
    , db = new Db.startup( "catanode-users" );

  before(function() {
    // Clear the database
    Db.User.remove({}, function(err) { 
      if( err ) {
        console.log( err );
        return;
      }
      console.log('Removed all users.');
    });
  });


  describe("/", function() {
    it('should return a successful status', function( done ) {
      browser.visit(base_url, function() {
        assert.ok(browser.success);

        if( browser.success ) {
          done();
        }
      });
    });
  });

  var fakeUser = {
    fname: "brad", lname: "olson",
    email: "foo@brad.io",
    username: "j",
    password: "020"
  };

  describe("/signup", function() {
    it('should successfully create a user', function( done ) {
      browser.visit(base_url + "/signup", function() {
        assert.ok( browser.success );

        browser
          .fill('.fname', fakeUser.fname)
          .fill('.lname', fakeUser.lname)
          .fill('.email', fakeUser.email)
          .fill('.username', fakeUser.username)
          .fill('.password', fakeUser.password)
          .pressButton('Sign Up', function( err ) {
            assert.ok( browser.success );

            if( !err ) {
              done();
            }
          });
      });
    });
  });

  describe("/login", function() {
    it('should return a successful status', function( done ) {
      browser.visit(base_url + "/login", function() {
        assert.ok( browser.success );

        if( browser.success ) {
          done();
        }
      });
    });

    it('should fill out information properly', function( done ) {
      browser.visit(base_url + "/login", function() {
        assert.ok( browser.success );

        browser
          .fill('.username', fakeUser.username)
          .fill('.password', fakeUser.password)
          .pressButton('Log In', function( err ) {
            assert.ok( browser.success );

            if( !err ) {
              done();
            }
          });
      });
    });
  });
});
