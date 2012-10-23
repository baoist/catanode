var util = require('util');

module.exports = function(app, io, gameserver, passport, db) {
  app.get('/', function(req, res) {
    return res.render('index', {
      user: req.user || null, 
      gameserver: gameserver
    });
  });

  app.get('/create', function(req, res) {
    var game_id = gameserver.create();

    if( typeof game_id === "number" ) {
      return res.redirect( '/connect/' + game_id );
    } else {
      return res.render('error', {
        reason: "Too many games are going on."
      });
    }
  });

  app.get('/connect', function(req, res) {
    return res.render('index');
  });

  app.get('/connect/:game_id', function(req, res) {
    if( !gameserver.games[req.params.game_id] ) {
      var new_id = gameserver.create(req.params.game_id);

      if (new_id !== req.params.game_id) {
        return res.redirect('/connect/' + new_id);
      }
    }

    if( req.user && io.client ) {
      io.client.join( req.params.game_id );

      // emit a user has joined 'game_view'
      io.client.in( '/' + req.params.game_id ).emit("game_view", { game: req.params.game_id, user: req.user.username });
    }

    return res.render('setup', {
      user: req.user || false,
      game_id: req.params.game_id,
      players: gameserver.games[req.params.game_id].players,
      url: req.headers.host + req.url
    });
  });

  app.get('/signup', function(req, res) {
    res.render('signup', { message: false });
  });

  app.post('/signup', function(req, res, next) {
    db.saveUser(req.body.user, function(err, user) {
      if( err ) {
        return res.render('signup', { message: err });
      } else {
        passport.authenticate('local', function(err, user, info) {
          if (err) { return next(err); }
          if (!user) { return res.redirect('/login'); }

          req.logIn(user, function(err) {
            if (err) { return next(err); }

            return res.redirect('/');
          });
        })(req, res, next);
      }
    });
  });

  app.get('/login', function(req, res){
    return res.render('login', { user: req.user, message: req.flash('error') });
  });

  app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/settings/:user', function(req, res) {
    if( req.user && req.user.username === req.params.user ) {
      return res.render('user/settings', { user: req.user });
    } else {
      db.userByUsername(req.params.user, function(err, user) {
        if( user ) {
          return res.render('user/view', { 
            user: false,
            searched: user
          });
        }

        return res.render('user/error', { 
          user: false, 
          error: "The user \"" + req.params.user + "\" doesn't exist."
        });
      });
    }
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('*', function(req, res) {
    res.status(404);

    // user or false
    return res.render('error', {
      user: false,
      status: res.statusCode,
      reason: "The page you requested was not found.",
      page: req.headers.host + req.url
    });
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
      return next(); 
    }
    res.redirect('/login');
  }
}
