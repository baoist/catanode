socket = io.connect('http://localhost/') # change to server.

class Lobby
  constructor: (name, chat, players) ->
    @url = document.URL
    @name = name || undefined
    @chat = chat || $('#chat form')
    @players = players || $('.player')
    @allowed = false
  
  join_chat: (name) ->
    self = this

    socket.emit 'join_chat', {
      name: name,
      game: self.url
    }

    @allowed = true

  format_join_chat: ->
    
  add_message: (message, input) ->
    self = this

    socket.emit 'game_message', {
      name: self.name,
      message: message,
      game: self.url
    }

    self.clear(input) if input

  join_game: (name, slot) ->
    self = this

    socket.emit 'join_game', {
      game: document.URL,
      slot: $('.player').index($(this).parent()) + 1,
      name: name
    }

  format_join_game: ->

  leave_game: ->

  format_leave_game: ->

  clear: (input) -> # for inputs
    $(input).val('')

swap_chat = (name) ->
  form = $('#set_name')
  form
    .attr('id', 'message')
    .prepend('<h2>' + name + '</h2>')
  form.find('input[type=submit]').val('Send')
  $('input[type=text]').val('')

jQuery(document).ready ->
  lobby = new Lobby()

  socket.on 'connect', (data) ->
    socket.emit 'join_lobby', { game: lobby.url }

  $('#chat form').submit (e) ->
    val = $(this).find('input[type=text]').val()
    return false if !val

    if !lobby.allowed
      lobby.join_chat val
      return false

    lobby.add_message val, $(this).find('input[type=text]')

    e.stopPropagation()
    e.preventDefault()

  $('a.join').click (e) ->
    lobby.join_game(lobby.name || $(this.prev().val()), lobby.players.index($(this).parent()) + 1)

    e.stopPropagation()
    e.preventDefault()

  socket.on 'join_game', (data) ->
    slot = $($('.player')[data.slot-1])
    name = $('<h2>' + data.name + '</h2>')
    icon = $('<img src=' + data.icon + ' />')

    self.username = data.name

    slot.children().remove()
    slot.append(name)
    slot.append(icon)

  socket.on 'allowed_lobbyist', (data) ->
    lobby.name = data.name
    swap_chat(data.name)

  socket.on 'not_allowed_lobbyist', (data) ->
    alert data.name + ' ' + data.message
  
  $('input[type!=submit]').focus ->
    $(this).val('')

  # chat
  '''
  $('#chat form').submit ->
    if $(this).attr('id') == 'set_name'
      socket.emit 'join_chat', { name: $(this).find('input[type=text]').val(), game: document.URL }
    else if $(this).attr('id') == 'message'
      message = $(this).find('input[type=text]').val()
      if message
        socket.emit 'game_message', { name: self.username || 'Name', message: message, game: document.URL }
        $(this).find('input[type=text]').val('')
    return false
  '''
    
  socket.on 'message', (data) ->
    if data.action == 'join'
      message = data.message
    else
      message = data.name + ': ' + data.message
      
    $('#chat #display').append('<p>' + message + '</p>')
