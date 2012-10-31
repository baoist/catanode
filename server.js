var requirejs = require('requirejs');

require('./lib/utility');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs([
  'http', 
  'underscore', 
  'backbone', 
  'express',
  'connect-flash',
  'passport',
  'passport-local',
  'socket.io', 
  'jade',
  'gameserver',
  'util'
], function(http, _, backbone, express, flash, passport, passport_local, socket, jade, gameserver, util) {
  var app = express()
    , server = http.createServer(app)
    , io = socket.listen(server)
    , port = process.env.PORT || 8080
    , MongooseStore = require('connect-mongoose')(express);

  gameserver.startup({
    maximum: 10000
  });

  var Db = require('./access-db')
    , db = new Db.startup( "catanode-users" )
    , SessionStore = new MongooseStore;

  app.configure(function() {
    app.engine('html', jade.renderFile);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + "/public/"));
    app.use(express.cookieParser('testcookieparser'));
    app.use(express.session({ 
      maxAge: new Date(Date.now() + 3600000),
      store: SessionStore,
      secret: 'catanodetesting'
    }, function() {
      app.use(app.router);
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.logger());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(app.router);
  });

  passport.socket = require('passport.socketio');

  require("./sockets")(express, app, io, passport, Db, SessionStore);
  require("./routes")(app, io, gameserver, passport, Db);
  
  server.listen(port);

  console.log( "Database live at: " + Db.data.connection() );
  console.log( "Server running at port: " + port );
});
