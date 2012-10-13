var socket = new Socket();

jQuery(document).ready(function() {

  // sockets
  socket.receive("game_view", function(foo) {
    console.log( foo )
  });

  socket.recieve("game_message", function(data) {
    console.log( data );
  });
});
