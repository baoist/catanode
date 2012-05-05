var rjs = require('requirejs');

rjs.config({
  nodeRequire: require
});

rjs([
  'http',
  'underscore',
  'backbone',
  'express',
  'socket.io',
  'jade',
  'gameserver'
], function(http, _, backbone, express, socket, jade, games) {
  var port, app;

  app = express.createServer();

  // setup
  socket = socket.listen(app);
  app.register('.jade', jade)
    .set('view engine', 'jade')
    .set('view options', {
      layout: false
    })
    .use(express.static(__dirname + "/public/"));

  // routes
  app.get('/', function(req, res) {
    return res.render('index');
  });

  // start server
  port = process.env.PORT || 2323;
  app.listen(port);
  console.log( "Server running at port: " + port);
})

/*
(function() {
  var requirejs;

  requirejs = require('requirejs');

  requirejs.config({
    nodeRequire: require
  });

  Array.prototype.last = function() {
    return this[this.length - 1];
  };

  String.prototype.port = function() {
    return parseInt(this.split('/').last().split(/[^0-9]/)[0]);
  };

  requirejs(['http', 'underscore', 'backbone', 'express', 'socket.io', 'jade', './lib/games'], function(http, _, backbone, express, socket, jade, games) {
    var app, port;
    console.log(games);
    app = express.createServer();
    socket = socket.listen(app);
    app.register('.jade', jade);
    app.set('view engine', 'jade');
    app.set('view options', {
      layout: false
    });
    app.use(express.static(__dirname + "/public/"));
    app.get('/', function(req, res) {
      return res.render('index');
    });
    app.get('/create', function(req, res) {
      var game_port;
      game_port = games.create();
      if (typeof game_port === 'number') {
        socket.rooms[game_port] = {};
        return res.redirect('/connect/' + game_port);
      } else {
        return res.render('error', {
          locals: {
            reason: game_port
          }
        });
      }
    });
    app.get('/error', function(req, res) {
      return res.render('error', {
        locals: {
          reason: "An error has occurred."
        }
      });
    });
    app.get('/connect', function(req, res) {
      return res.render('index');
    });
    app.get('/connect/:game_id', function(req, res) {
      var new_id;
      if (!games.list[req.params.game_id]) {
        new_id = games.create(req.params.game_id);
        if (new_id !== req.params.game_id) res.redirect('/connect/' + new_id);
      }
      return res.render('setup', {
        locals: {
          game_id: req.params.game_id,
          players: games.list[req.params.game_id].players,
          url: req.headers.host + req.url
        }
      });
    });
    socket.sockets.on('connection', function(client) {
      client.on('join_lobby', function(data) {
        return client.join(data.game.port());
      });
      client.on('join_chat', function(data) {
        var lobbyist, room;
        room = data.game.port();
        if (socket.rooms['/' + room].indexOf(client.id) > -1) {
          lobbyist = games.add_lobby(room, client.handshake.address.address, client.id, data.name);
          if (lobbyist) {
            return client.emit('allowed', {
              name: lobbyist.name,
              type: 'chat',
              message: 'has connected to the server.'
            });
          } else {
            return client.emit('not_allowed', {
              name: data.name,
              message: 'is already taken in this chat.'
            });
          }
        }
      });
      client.on('join_game', function(data) {
        var player, room, slot;
        room = data.game.port();
        slot = data.slot !== -1 ? data.slot : 1;
        if (socket.rooms['/' + room].indexOf(client.id) > -1) {
          player = games.add_player(room, data.slot, data.name);
          if (player) {
            client.emit('allowed', {
              name: player.name,
              type: 'game',
              message: 'has joined the game.'
            });
            return socket.sockets["in"](room).emit('join_game', {
              name: data.name,
              slot: slot,
              icon: player.icon
            });
          }
        }
      });
      client.on('leave_game', function(data) {
        var room;
        return room = data.game.port();
      });
      client.on('game_message', function(data) {
        var room;
        room = data.game.port();
        if (socket.rooms['/' + room].indexOf(client.id) > -1) {
          return socket.sockets["in"](room).emit('message', {
            action: 'message',
            name: data.name,
            message: data.message
          });
        }
      });
      return client.on('disconnect', function(data) {
        var name, room, rooms, _results;
        rooms = client.manager.roomClients[client.id];
        _results = [];
        for (room in rooms) {
          room = room.port();
          name = games.in_lobby(room, client.id);
          if (!room || !name) continue;
          games.purge_lobby(room, name);
          _results.push(socket.sockets["in"](room).emit('message', {
            action: 'message',
            name: name,
            message: 'has left the server.'
          }));
        }
        return _results;
      });
    });
    port = process.env.PORT || 8080;
    return app.listen(port);
  });

}).call(this);
*/
