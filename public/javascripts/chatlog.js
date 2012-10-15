jQuery(document).ready(function() {

  var log = {
    elements: {
      container: $('#chat'),
      log: $('#display'),
      form: $('form#message'),
      template: $('<p/>', {
        class: 'foo',
        id: 'bar'
      })
    }
  };

  log.elements.form.submit(function(e) {
    e.preventDefault();

    socket.send('game_message', { message: $(this).find('input').first().text() });
    console.log( 'sending' );

    return;
  });

  // sockets
  if( typeof socket === "undefined" ) {
    var socket = new Socket();
  }

  socket.connection.on("game_view", function(data ) {
    if( data.user ) {
    
    }
    console.log( data.user )
    console.log( data );
  });
});
