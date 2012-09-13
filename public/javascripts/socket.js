var Socket;

Socket = (function() {
  function Socket(data) {
    this.connection = io.connect(data.url || 'http://localhost');
  }
}());
(function() {
  var Lobby, socket;
  socket = io.connect('http://localhost/');
  Lobby = (function() {
    function Lobby(name, chat, players) {
      this.url = document.URL;
      this.name = name || void 0;
      this.chat_display = chat || $('#chat #display');
      this.chat_form = chat || $('#chat form');
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
    Lobby.prototype.disconnect_chat = function(name) {};
    Lobby.prototype.format_chat = function(name) {
      this.chat_form.attr('id', 'message');
      if (!this.chat_form.find('h2')) {
        this.chat_form.prepend('<h2>' + name + '</h2>');
      }
      this.chat_form.find('input[type=submit]').val('Send');
      return this.chat_form.find('input[type=text]').val('');
    };
    Lobby.prototype.add_message = function(name, message) {
      var self;
      self = this;
      return socket.emit('game_message', {
        name: name,
        message: message,
        game: self.url
      });
    };
    Lobby.prototype.join_game = function(name, slot) {
      var self;
      self = this;
      return socket.emit('join_game', {
        game: document.URL,
        slot: slot,
        name: name
      });
    };
    Lobby.prototype.format_join_game = function(slot, name, icon) {
      var i, n;
      slot = $($('.player')[slot]);
      n = $('<h2>' + name + '</h2>');
      i = $('<img src=' + icon + ' />');
      slot.children().remove();
      slot.append(n);
      return slot.append(i);
    };
    Lobby.prototype.leave_game = function() {};
    Lobby.prototype.format_leave_game = function() {};
    Lobby.prototype.clear = function(input) {
      return $(input).val('');
    };
    return Lobby;
  })();
  jQuery(document).ready(function() {
    var lobby;
    lobby = new Lobby();
    socket.on('connect', function(data) {
      return socket.emit('join_lobby', {
        game: lobby.url
      });
    });
    $('#chat form').submit(function(e) {
      var input;
      input = $(this).find('input[type=text]');
      if (!input.val()) {
        return false;
      }
      if (!lobby.allowed) {
        lobby.join_chat(input.val());
        return false;
      }
      lobby.add_message(lobby.name, input.val());
      input.val('');
      e.stopPropagation();
      return e.preventDefault();
    });
    $('a.join').click(function(e) {
      lobby.join_game(lobby.name || $(this).prev().val(), lobby.players.index($(this).parent()) + 1);
      e.stopPropagation();
      return e.preventDefault();
    });
    socket.on('join_game', function(data) {
      return lobby.format_join_game(data.slot - 1, data.name, data.icon);
    });
    socket.on('allowed', function(data) {
      lobby.allowed = true;
      lobby.name = data.name;
      lobby.format_chat(data.name);
      lobby.add_message(data.name, data.message);
      switch (data.type) {
        case "chat":
          return lobby.players.find('input').remove();
        case "game":
          return lobby.players.find('.join, input').remove();
      }
    });
    socket.on('not_allowed', function(data) {
      lobby.allowed = false;
      return alert(data.name + ' ' + data.message);
    });
    socket.on('message', function(data) {
      var message;
      switch (data.action) {
        case "join":
          message = data.message;
          break;
        default:
          message = data.name + ': ' + data.message;
      }
      lobby.chat_display.append('<p>' + message + '</p>');
      return lobby.chat_display.scrollTop(lobby.chat_display.prop('scrollHeight') - lobby.chat_display.height());
    });
    socket.on('disconnect', function(data) {
      return lobby.add_message(data.name, data.message);
    });
    return $('input[type!=submit]').focus(function() {
      return $(this).val('');
    });
  });
}).call(this);
