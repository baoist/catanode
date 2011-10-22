http = require 'http'
_ = require 'underscore'
backbone = require 'backbone'

express = require 'express'
app = express.createServer()
socket = require('socket.io').listen(app)

app.register '.jade', require 'jade'
app.set 'view engine', 'jade'
app.set 'view options', {
  layout: false
}
app.use express.static(__dirname + "/public/")

games_server = require('./lib/games')
games = new games_server.start(0, 9000)
# games = require('./lib/games').start(0, 10000) # change to this

app.get '/', (req, res) ->
  res.render 'index'

app.get '/create', (req, res) ->
  game_port = games.create()
  if typeof game_port == 'number'
    socket.rooms[game_port] = {}
    res.redirect '/connect/' + game_port
  else
    res.redirect '/error', locals:
                           reason: game_port

app.get '/error', (req, res) ->

app.get '/connect', (req, res) ->
  res.render 'index'

app.get '/connect/:game_id', (req, res) ->
  if !games.list[req.params.game_id]
    games.create(req.params.game_id)

  res.render 'setup', locals:
                        game_id: req.params.game_id,
                        players: games.list[req.params.game_id].players,
                        url: req.headers.host + req.url

Array::last = ->
  return this[this.length-1]

String::port = -> # pulls port from a requesting url (the last character string)
  return parseInt(this.split('/').last().split(/[^0-9]/)[0])

socket.sockets.on 'connection', (client) ->
  client.on 'join_lobby', (data) -> # any user joins the main lobby
    client.join data.game.port()

  client.on 'join_chat', (data) -> # user connects via name input on lobby screen
    room = data.game.port()
    if socket.rooms['/' + room].indexOf(client.id) > -1
      lobbyist = games.add_lobby room, client.handshake.address, client.id, data.name
      if lobbyist
        socket.sockets.in(data.game.port()).emit 'message', { action: 'join', message: lobbyist.name + ' has connected to the server.'}
        client.emit 'allowed_lobbyist', { name: lobbyist.name }
      else
        client.emit 'not_allowed_lobbyist', { name: data.name, message: 'is already taken in this chat.' }

  client.on 'join_game', (data) ->
    room = data.game.port()
    slot = if data.slot != -1 then data.slot else 1
    if socket.rooms['/' + room].indexOf(client.id) > -1
      player = games.add_player room, data.slot, data.name
      if player
        socket.sockets.in(room).emit 'join_game', { action: 'has joined the game.', name: data.name, slot: slot, icon: player.icon }

  client.on 'game_message', (data) ->
    room = data.game.port()
    if socket.rooms['/' + room].indexOf(client.id) > -1
      socket.sockets.in(room).emit 'message', { action: 'message', name: data.name, message: data.message }

port = process.env.PORT || 8080
app.listen port
console.log 'Server listening on port: ' + port
