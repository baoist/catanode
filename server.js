(function() {
  var app, backbone, express, games, http, port, redis, socket, _;
  http = require('http');
  _ = require('underscore');
  backbone = require('backbone');
  redis = require('redis');
  express = require('express');
  app = express.createServer();
  socket = require('socket.io').listen(app);
  app.register('.jade', require('jade'));
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.static(__dirname + "/public/"));
  games = require('./lib/games');
  console.log(new games.create(0, 9000));
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
  app.get('/connect', function(req, res) {
    return res.render('index');
  });
  app.get('/connect/:game_id', function(req, res) {
    var i, players, status;
    players = [];
    for (i = 1; i <= 2; i++) {
      if (i === 1) {
        status = 'creator';
      } else {
        status = 'player';
      }
      players.push({
        name: 'foo' + i,
        ip: '0.0.0.0',
        icon: 'http://placekitten.com/400/300',
        status: status
      });
    }
    players.push({
      icon: 'http://placekitten.com/400/300'
    });
    players.push({
      icon: 'http://placekitten.com/400/300'
    });
    return res.render('setup', {
      locals: {
        game_id: req.params.game_id,
        players: players,
        url: req.headers.host + req.url
      }
    });
  });
  socket.sockets.on('connection', function(client) {
    console.log(' ------ ');
    console.log(socket.rooms);
    console.log(' ------ ');
    socket.sockets.emit('connect', {
      user: 'joined'
    });
    return client.on('join_lobby', function(data) {
      console.log(data);
      return client.join(data.game);
    });
  });
  port = process.env.PORT || 8080;
  app.listen(port);
}).call(this);
