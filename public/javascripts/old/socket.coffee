socket = io.connect('http://localhost/') # change to server.

class Lobby
  constructor: (name, chat, players) ->
    @url = document.URL
    @name = name || undefined
    @chat_display = chat || $('#chat #display')
    @chat_form = chat || $('#chat form')
    @players = players || $('.player')
    @allowed = false
  
  join_chat: (name) ->
    self = this

    socket.emit 'join_chat', {
      name: name,
      game: self.url
    }

    @allowed = true

  disconnect_chat: (name) ->
    

  format_chat: (name) ->
    @chat_form.attr('id', 'message')
    @chat_form.prepend('<h2>' + name + '</h2>') if !@chat_form.find('h2')
    @chat_form.find('input[type=submit]').val('Send')
    @chat_form.find('input[type=text]').val('')
    
  add_message: (name, message) ->
    self = this

    socket.emit 'game_message', {
      name: name,
      message: message,
      game: self.url
    }

  join_game: (name, slot) ->
    self = this

    socket.emit 'join_game', {
      game: document.URL,
      slot: slot,
      name: name
    }

  format_join_game: (slot, name, icon) ->
    slot = $($('.player')[slot])
    # n being username, i being icon
    n = $('<h2>' + name + '</h2>')
    i = $('<img src=' + icon + ' />')

    slot.children().remove()
    slot.append(n)
    slot.append(i)

  leave_game: ->

  format_leave_game: ->

  clear: (input) -> # for inputs
    $(input).val('')

jQuery(document).ready ->
  lobby = new Lobby()

  socket.on 'connect', (data) ->
    socket.emit 'join_lobby', { game: lobby.url }

  $('#chat form').submit (e) ->
    input = $(this).find('input[type=text]')
    return false if !input.val()

    if !lobby.allowed
      lobby.join_chat input.val()
      return false

    lobby.add_message(lobby.name, input.val())
    input.val('')

    e.stopPropagation()
    e.preventDefault()

  $('a.join').click (e) ->
    lobby.join_game(lobby.name || $(this).prev().val(), lobby.players.index($(this).parent()) + 1)

    e.stopPropagation()
    e.preventDefault()

  socket.on 'join_game', (data) ->
    lobby.format_join_game(data.slot - 1, data.name, data.icon)

  socket.on 'allowed', (data) ->
    lobby.allowed = true
    lobby.name = data.name

    lobby.format_chat(data.name)
    lobby.add_message(data.name, data.message)
    
    switch data.type
      when "chat" then lobby.players.find('input').remove()
      when "game" then lobby.players.find('.join, input').remove()


  socket.on 'not_allowed', (data) ->
    lobby.allowed = false
    alert data.name + ' ' + data.message
  
  socket.on 'message', (data) ->
    switch data.action
      when "join" then message = data.message
      else message = data.name + ': ' + data.message
      
    lobby.chat_display.append('<p>' + message + '</p>')
    lobby.chat_display.scrollTop(lobby.chat_display.prop('scrollHeight') - lobby.chat_display.height())

  socket.on 'disconnect', (data) ->
    lobby.add_message(data.name, data.message)

  $('input[type!=submit]').focus ->
    $(this).val('')
