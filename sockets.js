module.exports = function(app, io, gameserver, passport) {
  io.sockets.on('connection', function(client) {
    client.on('join_lobby', function(data) {
      console.log( data );
    });
  });
}
