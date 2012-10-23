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
  'socket.io', 
  'jade',
  'gameserver',
  'util'
], function(http, _, backbone, express, flash, passport, passport_local, mongoStore, socket, jade, gameserver, util) {
  var app = express()
    , server = http.createServer(app)
    , io = socket.listen(server)
    , port = process.env.PORT || 8080;

  var Db = require('./access-db')
    , db = new Db.startup( "catanode-users" );

  app.configure(function() {
    app.engine('html', jade.renderFile);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + "/public/"));
    app.use(express.cookieParser('testcookieparser'));
    app.use(express.session({ 
      maxAge: new Date(Date.now() + 3600000),
      store: mongoStore({ db: db }, function(err){
        console.log( '-- mongo connection start --' );
        console.log( err || 'connect-mongodb setup ok' );
        console.log( '-- mongo connection end --' );
      }),
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

  require("./sockets")(express, app, io, gameserver, passport, Db);
  require("./routes")(app, io, gameserver, passport, Db);
  
  server.listen(port);

  console.log( "Database live at: " + Db.data.connection );
  console.log( "Server running at port: " + port);
});
