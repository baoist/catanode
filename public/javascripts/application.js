if( typeof socket === "undefined" ) {
  var socket = new Socket();
}

jQuery(document).ready(function() {

  // sockets

  socket.receive("game_view", function(foo) {
    console.log( foo );
  });

  socket.receive("game_message", function( data ) {
    alert( data.from + " says: " + data.message );
  });
});
