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
    fail: function(test, accept) {
      accept(null, false);
    },
    success: function(test, accept) {
      accept(null, true);
    }
  }));

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
      console.log( 'game message received' )
      console.log( data );
      // console.log( client.handshake.user.username );
    })
  });
}
