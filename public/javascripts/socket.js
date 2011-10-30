(function() {
  var Lobby, socket, swap_chat;
  socket = io.connect('http://localhost/');
  Lobby = (function() {
    function Lobby(name, chat, players) {
      this.url = document.URL;
      this.name = name || void 0;
      this.chat = chat || $('#chat form');
      this.players = players || $('.player');
      this.allowed = false;
    }
    Lobby.prototype.join_chat = function(name) {
      var self;
      self = this;
      socket.emit('join_chat', {
        name: name,
        game: self.url
      });
      return this.allowed = true;
    };
    Lobby.prototype.format_join_chat = function() {};
    Lobby.prototype.add_message = function(message, input) {
      var self;
      self = this;
      socket.emit('game_message', {
        name: self.name,
        message: message,
        game: self.url
      });
      if (input) {
        return self.clear(input);
      }
    };
    Lobby.prototype.join_game = function(name, slot) {
      var self;
      self = this;
      return socket.emit('join_game', {
        game: document.URL,
        slot: $('.player').index($(this).parent()) + 1,
        name: name
      });
    };
    Lobby.prototype.format_join_game = function() {};
    Lobby.prototype.leave_game = function() {};
    Lobby.prototype.format_leave_game = function() {};
    Lobby.prototype.clear = function(input) {
      return $(input).val('');
    };
    return Lobby;
  })();
  swap_chat = function(name) {
    var form;
    form = $('#set_name');
    form.attr('id', 'message').prepend('<h2>' + name + '</h2>');
    form.find('input[type=submit]').val('Send');
    return $('input[type=text]').val('');
  };
  jQuery(document).ready(function() {
    var lobby;
    lobby = new Lobby();
    socket.on('connect', function(data) {
      return socket.emit('join_lobby', {
        game: lobby.url
      });
    });
    $('#chat form').submit(function(e) {
      var val;
      val = $(this).find('input[type=text]').val();
      if (!val) {
        return false;
      }
      if (!lobby.allowed) {
        lobby.join_chat(val);
        return false;
      }
      lobby.add_message(val, $(this).find('input[type=text]'));
      e.stopPropagation();
      return e.preventDefault();
    });
    $('a.join').click(function(e) {
      lobby.join_game(lobby.name || $(this.prev().val()), lobby.players.index($(this).parent()) + 1);
      e.stopPropagation();
      return e.preventDefault();
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
    socket.on('allowed_lobbyist', function(data) {
      lobby.name = data.name;
      return swap_chat(data.name);
    });
    socket.on('not_allowed_lobbyist', function(data) {
      return alert(data.name + ' ' + data.message);
    });
    $('input[type!=submit]').focus(function() {
      return $(this).val('');
    });
    '$(\'#chat form\').submit ->\n  if $(this).attr(\'id\') == \'set_name\'\n    socket.emit \'join_chat\', { name: $(this).find(\'input[type=text]\').val(), game: document.URL }\n  else if $(this).attr(\'id\') == \'message\'\n    message = $(this).find(\'input[type=text]\').val()\n    if message\n      socket.emit \'game_message\', { name: self.username || \'Name\', message: message, game: document.URL }\n      $(this).find(\'input[type=text]\').val(\'\')\n  return false';
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
