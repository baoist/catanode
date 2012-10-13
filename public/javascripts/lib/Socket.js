var Socket;

Socket = (function() {
  function Socket( data ) {
    if( typeof data !== "object" ) {
      data = {};
    }

    this.url = data.URL || window.location.host;
    this.connection = this.connect();

    this.senders = {};
    this.receivers = {};
  }

  Socket.prototype.connect = function() {
    if( io ) {
      return io.connect( this.url );
    }

    throw "io doesn't exist.";
  }

  Socket.prototype.send = function( name, data ) {
    if( typeof name === undefined ) {
      return;
    }

    this.senders[type] = data || {};

    return this.connection.emit(type, this.senders[type]);
  }

  Socket.prototype.receive = function( type, action ) {
    if( typeof type === "undefined" || typeof action === "undefined" ) {
      return;
    }

    return this.receivers[type] = action;

    this.connection.on(type, this.receivers[type]);
  }

  return Socket;
})();
