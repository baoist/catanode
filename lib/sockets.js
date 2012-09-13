module.exports = function(app, socket, gameserver) {
  socket.sockets.on('connection', function(client) {
    client.on('join_lobby', function(data) {
      console.log( data );
    });
  });
}
