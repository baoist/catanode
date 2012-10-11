var util = require('util');

module.exports = function(app, io, gameserver, passport, db) {
  app.get('/', function(req, res) {
    console.log( gameserver.create() );
    console.log( gameserver.create() );
    console.log( gameserver.create() );
    console.log( gameserver.create() );
    console.log( gameserver.create() );

    return res.render('index', {
      user: req.user || null, 
      gameserver: gameserver
    });
  });

  app.get('/create', function(req, res) {
    var game_port = gameserver.create();

    if( typeof game_port === "number" ) {
      socket.rooms[game_port] = {};

      return res.redirect( '/connect/' + game_port );
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

    return res.render('setup', {
      game_id: req.params.game_id,
      players: gameserver.games[req.params.game_id].players,
      url: req.headers.host + req.url
    });
  });

  app.get('/join', function(req, res) {
    return res.render('join');
  });

  app.post('/join', function(req, res, next) {
    var errs = []; 

    /*
    switch(true) {
      // error handling, fix callback issue thing stuff do.
      case !!app.users.findOne({ username: req.body.user.username }):
        app.users.findOne({'username': 'asd'}, function(err, user) {
          if( !user ) {
            errs.push("Username already exists");
          }
        });
        break;
    }
    */

    console.log(errs);

    app.users.insert(req.body.user, function(err, doc) {
      if( err ) {
        return next(err);
      }

      res.redirect('/');
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
  })

  app.get('/login', function(req, res){
    return res.render('login', { user: req.user, message: req.flash('error') });
  });

  app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('*', function(req, res) {
    res.status(404);

    return res.render('error', {
      status: res.statusCode,
      reason: "The page you requested was not found.",
      page: req.headers.host + req.url
    });
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
      return next(); 
    }
    res.redirect('/login')
  }
}
