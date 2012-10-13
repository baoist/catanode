// NEEDED EMISSIONS:
//
// Game / Lobby
//  user joins lobby
//  user takes slot
//  user types in chat
//

module.exports = function(app, io, gameserver, passport, socket) {
  io.sockets.on('connection', function(client) {

    // Lobby / Games

    client.on('game_view', function(data) {
      console.log( '-- start game_view -- ' );
      console.log( data );
      console.log( '-- end game_view -- ' );
      return { foo: "Bar", baz: "wibble" };
    });

    client.on('game_occupy', function(data) {
      console.log( '-- start game_occupy -- ' );
      console.log( data );
      console.log( '-- end game_occupy -- ' );
      console.log( data );
    });

    client.on('game_message', function(data) {
      console.log( '-- start game_message -- ' );
      console.log( data );
      console.log( '-- end game_message -- ' );
    })
  });
}
