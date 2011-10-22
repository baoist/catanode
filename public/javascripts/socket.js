(function() {
  var socket;
  socket = io.connect('http://localhost/');
  jQuery(document).ready(function() {
    var self;
    self = this;
    self.username = 'Name';
    socket.on('connect', function(data) {
      return socket.emit('join_lobby', {
        game: document.URL
      });
    });
    socket.on('join_game', function(data) {
      var icon, name, slot;
      slot = $($('.player')[data.slot - 1]);
      name = $('<h2>' + data.name + '</h2>');
      icon = $('<img src=' + data.icon + ' />');
      self.username = data.name;
      slot.children().remove();
      slot.append(name);
      return slot.append(icon);
    });
    $('a.join').click(function(e) {
      socket.emit('join_game', {
        game: document.URL,
        slot: $('.player').index($(this).parent()) + 1,
        name: $(this).prev().val()
      });
      e.stopPropagation();
      return e.preventDefault();
    });
    $('input[type!=submit]').focus(function() {
      return $(this).val('');
    });
    $('#chat form').submit(function() {
      socket.emit('join_chat', {
        name: $(this).find('input[type=text]').val(),
        game: document.URL
      });
      return false;
    });
    $('#chat a').click(function(e) {
      var message;
      message = $(this).prev().val();
      if (message) {
        socket.emit('game_message', {
          name: self.username || 'Name',
          message: message,
          game: document.URL
        });
        $(this).prev().val('');
      }
      e.stopPropagation();
      return e.preventDefault();
    });
    return socket.on('message', function(data) {
      var message;
      if (data.action === 'join') {
        message = data.message;
      } else {
        message = data.name + ': ' + data.message;
      }
      return $('#chat #display').append('<p>' + message + '</p>');
    });
  });
}).call(this);
