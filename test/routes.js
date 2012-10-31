var Browser = require("zombie")
  assert = require("assert");

var browser = new Browser()
  , base_url = "http://localhost:8080";

describe('Routes', function() {
  var Db = require('../access-db')
    , db = new Db.startup( Db.data.connection() + "/catanode-users-test" );

  var fakeUser = {
    fname: "b-rad", lname: "olson",
    email: "foo@brad.io",
    username: "bao",
    password: "pass"
  };

  before(function() {
    Db.User.remove({}, function() {
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
});
