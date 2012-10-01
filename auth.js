module.exports = function(app, passport_local, passport, db) {
  LocalStrategy = passport_local.Strategy;

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    app.users.findOne({ _id: id }, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username, password: password }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
}
