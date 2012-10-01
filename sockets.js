// NEEDED EMISSIONS:
//
// Game / Lobby
//  user joins lobby
//  user takes slot
//  user types in chat
//
//
//
module.exports = function(app, io, gameserver, passport) {
  io.sockets.on('connection', function(client) {

    // Lobby / Games

    client.on('game_view', function(data) {
      console.log( data );
    });

    client.on('game_occupy', function(data) {
      console.log( data );
    });

    client.on('game_message', function(data) {
      console.log( data );
    })
  });
}
