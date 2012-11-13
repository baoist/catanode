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
    },
    init: function() {

    },
    write: function( message ) {
      var self = this;

      this.elements.log.append(
        self.elements.template.clone().text( message )
      );
    }
  };

  log.elements.form.submit(function(e) {
    e.preventDefault();

    socket.send('game_message', { message: $(this).find('input').first().val() });

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

  socket.receive("game_message", function( data ) {
    log.write( data.from + " says: " + data.message );
  });
});
