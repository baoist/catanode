// NEEDED EMISSIONS:
//
// Game / Lobby
//  user joins lobby
//  user takes slot
//  user types in chat
//

module.exports = function(app, io, gameserver, passport, socket) {
  io.set('authorization', function(data, accept) {
    /*
    console.log( 'start data' );
    console.log( data );
    console.log( 'start data' );
    console.log( 'start accept' );
    console.log( accept );
    console.log( 'start accept' );
    */
  });

  io.sockets.on('connection', function(client) {
    io.client = client;

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
      console.log( app );
      console.log( client.handshake );
    })
  });
}
