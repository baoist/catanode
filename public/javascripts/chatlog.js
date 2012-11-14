jQuery(document).ready(function() {
  var log = {
    chatHeight: 0,
    elements: {
      container: $('#chat'),
      log: $('#display'),
      write: $('#display div').first(),
      form: $('form#message'),
      template: function( text, className ) {
        var template = $('<p/>'),
          cloned = template.clone();

        if( typeof text === "undefined" ) {
          return template;
        }

        cloned.text( text );
        cloned.attr( 'class', (typeof className === "object") ? className.join(' ') : className );

        return cloned;
      }
    },
    init: function() {

    },
    write: function( message, className ) {
      var self = this
        , template = self.elements.template( message, className || '' );

      this.elements.write.append( template );

      this.forceBottom();
    },
    forceBottom: function() {
      // pushes messages to most recent / bottom. 
      this.elements.log.scrollTop( this.elements.write.outerHeight() );
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
    log.write( data.from + " says: " + data.message, "message" );
  });
});
