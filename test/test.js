var assert = require("assert");

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
});

describe('Connection', function() {
  var Db = require('../access-db')
    , db = new Db.startup( Db.data.connection() + "/catanode-users-test" );

  before(function() {
    // clear db.
  });

  describe("#saveUser()", function() {
    it('should create a new user', function(done) {
      Db.saveUser({
        fname: "b-rad", lname: "olson",
        email: "foo@brad.io",
        username: "bao!",
        password: "wibblez"
      }, function(err, user) {
        done();
      });
    });
  });
});
