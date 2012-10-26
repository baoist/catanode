// NEEDED EMISSIONS:
//
// Game / Lobby
//  user joins lobby
//  user takes slot
//  user types in chat
//

module.exports = function(express, app, io, passport, db, store) {
  io.set('authorization', passport.socket.authorize({
    sessionKey:    'connect.sid',
    sessionStore:  store,
    sessionSecret: "catanodetesting",
    fail: function(data, accept) {
      accept(null, true);
    },
    success: function(data, accept) {
      accept(null, true);
    }
  }));

  io.sockets.on('connection', function(client) {
    client.authenticated = function() {
      return (client.handshake.user && client.handshake.user.username);
    };
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
      console.log( 'game message received' )
      console.log( client.handshake );
      console.log( data );
      if( client.authenticated() ) {
        console.log( 'You\'re logged in!' );
      }
    });

    io.client = client;
  });
}
