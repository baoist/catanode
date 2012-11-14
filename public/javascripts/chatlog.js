jQuery(document).ready(function() {
  var log = {
    elements: {
      container: $('#chat'),
      log: $('#display'),
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

      this.elements.log.append( template );

      this.forceBottom();
    },
    forceBottom: function() {
      // pushes messages to most recent / bottom. 
      var offset = 0;
      for( var k=0, message; message = this.elements.log.children()[k++]; ) {
        offset += $( message ).height();
      }

      this.elements.log.scrollTop( offset );
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
