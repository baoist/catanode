var util = require('util');

module.exports = function(app, io, gameserver, passport) {
  app.get('/', function(req, res) {
    return res.render('index');
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

  app.get('/login', function(req, res){
    res.render('login', { user: req.user, message: req.flash('error') });
  });

  app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/logout', function(req, res){
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