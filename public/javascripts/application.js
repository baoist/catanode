var socket = new Socket();

jQuery(document).ready(function() {

  // sockets

  socket.connection.on("game_view", function(data ) {
    console.log( data );
  });

  socket.receive("game_view", function(foo) {
    console.log( foo );
  });

  socket.receive("game_message", function(foo) {
    console.log( foo );
  });
});
