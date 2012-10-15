var requirejs = require('requirejs');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

require('./lib/utility');

requirejs([
  'http', 
  'underscore', 
  'backbone', 
  'express',
  'connect-flash',
  'passport',
  'passport-local',
  'connect-mongodb',
  'mongoose',
  'socket.io', 
  'jade',
  'gameserver',
  'util'
], function(http, _, backbone, express, flash, passport, passport_local, mongoStore, mongoose, socket, jade, gameserver, util) {
  var app = express()
    , server = http.createServer(app)
    , io = socket.listen(server)
    , port = process.env.PORT || 8080;

  var Db = require('./access-db');

  app.configure(function() {
    app.engine('html', jade.renderFile);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + "/public/"));
    app.use(express.cookieParser('testcookieparser'));
    app.use(express.session({ 
      maxAge: 60000,
      store: mongoStore( Db.data.connection() ),
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

  var db = new Db.startup( Db.data.connection() + "/catanode-users" );

  console.log( express.session );

  require("./sockets")(app, io, gameserver, passport, Db);
  require("./routes")(app, io, gameserver, passport, Db);
  
  server.listen(port);

  console.log( "Database live at: " + Db.data.connection() );
  console.log( "Server running at port: " + port);
});
