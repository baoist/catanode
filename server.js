var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs([
  'http', 
  'underscore', 
  'backbone', 
  'express', 
  'socket.io', 
  'jade',
  'gameserver',
  'lib/utility'
], function(http, _, backbone, express, socket, jade, gameserver) {
  var app, port;

  app = express.createServer();
  port = process.env.PORT || 2323;

  app.engine('html', jade.renderFile)
    .set('view engine', 'jade')
    .set('views', __dirname + '/views')
    .use(express.static(__dirname + "/public/"));

  socket = socket.listen(app);

  app.get('/', function(req, res) {
    return res.render('index');
  });

  app.get('/create', function(req, res) {
    // change this,
    // default to test.
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

  require("./lib/sockets")(app, socket, gameserver);

  app.listen(port);
  console.log( "Server running at port: " + port);
});
