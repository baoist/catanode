(function() {
  var app, backbone, express, games, games_server, http, port, socket, _;
  http = require('http');
  _ = require('underscore');
  backbone = require('backbone');
  express = require('express');
  app = express.createServer();
  socket = require('socket.io').listen(app);
  app.register('.jade', require('jade'));
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.static(__dirname + "/public/"));
  games_server = require('./lib/games');
  games = new games_server.start(0, 9000);
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
      return res.redirect('/error', {
        locals: {
          reason: game_port
        }
      });
    }
  });
  app.get('/error', function(req, res) {});
  app.get('/connect', function(req, res) {
    return res.render('index');
  });
  app.get('/connect/:game_id', function(req, res) {
    if (!games.list[req.params.game_id]) {
      games.create(req.params.game_id);
    }
    return res.render('setup', {
      locals: {
        game_id: req.params.game_id,
        players: games.list[req.params.game_id].players,
        url: req.headers.host + req.url
      }
    });
  });
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
  String.prototype.port = function() {
    return parseInt(this.split('/').last().split(/[^0-9]/)[0]);
  };
  socket.sockets.on('connection', function(client) {
    client.on('join_lobby', function(data) {
      return client.join(data.game.port());
    });
    client.on('join_chat', function(data) {
      var lobbyist, room;
      room = data.game.port();
      if (socket.rooms['/' + room].indexOf(client.id) > -1) {
        lobbyist = games.add_lobby(room, client.handshake.address, client.id, data.name);
        if (lobbyist) {
          socket.sockets["in"](data.game.port()).emit('message', {
            action: 'join',
            message: lobbyist.name + ' has connected to the server.'
          });
          return client.emit('allowed_lobbyist', {
            name: lobbyist.name
          });
        } else {
          return client.emit('not_allowed_lobbyist', {
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
          return socket.sockets["in"](room).emit('join_game', {
            action: 'has joined the game.',
            name: data.name,
            slot: slot,
            icon: player.icon
          });
        }
      }
    });
    return client.on('game_message', function(data) {
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
  });
  port = process.env.PORT || 8080;
  app.listen(port);
  console.log('Server listening on port: ' + port);
}).call(this);
