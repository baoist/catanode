// NEEDED EMISSIONS:
//
// Game / Lobby
//  user joins lobby
//  user takes slot
//  user types in chat
//

var socketPassportBridge = require('passport.socketio')
  , mongoose = require('mongoose');

module.exports = function(express, app, io, gameserver, passport, socket) {
  /*
  io.set('authorization', socketPassportBridge.authorize({
    sessionKey:    'testcookieparser',
    sessionStore:  mongoose,
    sessionSecret: "catanodetesting"
  }));
  */

  io.sockets.on('connection', function(client) {
    io.client = client;

    console.log('foo')
    console.log( client );

    // Lobby / Games

    client.on('game_view', function(data) {
      console.log( io.sockets );
      io.sockets.in( '/' + data.port ).emit("game_view", data);
    });

    client.on('game_occupy', function(data) {
      console.log( '-- start game_occupy -- ' );
      console.log( data );
      console.log( '-- end game_occupy -- ' );
      console.log( data );
    });

    client.on('game_message', function(data) {
      console.log( data );
      console.log( app );
      console.log( client.handshake );
    })
  });
}
