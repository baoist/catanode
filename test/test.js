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
  var Db = require('../access-db');

  describe("#create()", function() {
    it('should create a new user', function(done) {
      var db = new Db.startup( Db.data.connection() + "/catanode-users-test" );

      Db.getUsers(function(err, users) {
        users.drop();
      });

      Db.saveUser({
        fname: "b-rad", lname: "olson",
        email: "foo@brad.io",
        username: "bao!",
        password: "wibblez"
      });
    });
  });
});
