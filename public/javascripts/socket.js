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
    Lobby.prototype.format_chat = function(name) {
      this.chat_form.attr('id', 'message').prepend('<h2>' + name + '</h2>').find('input[type=submit]').val('Send');
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
      var val;
      val = $(this).find('input[type=text]');
      if (!val.val()) {
        return false;
      }
      if (!lobby.allowed) {
        lobby.join_chat(val.val());
        return false;
      }
      val.val('');
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
    $('input[type!=submit]').focus(function() {
      return $(this).val('');
    });
    return socket.on('message', function(data) {
      var message;
      if (data.action === 'join') {
        message = data.message;
      } else {
        message = data.name + ': ' + data.message;
      }
      return lobby.chat_display.append('<p>' + message + '</p>');
    });
  });
}).call(this);
