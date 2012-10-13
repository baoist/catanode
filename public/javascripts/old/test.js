socket = io.connect('http://localhost/');

setTimeout(function() {
  socket.emit('join_lobby', {
    name: "foo",
    game: "bar"
  });

  console.log( socket );
}, 1000);
