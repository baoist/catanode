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
  'mongodb',
  'socket.io', 
  'jade',
  'gameserver',
  'util'
], function(http, _, backbone, express, flash, passport, passport_local, mongo, socket, jade, gameserver, util) {
  var app = express()
    , server = http.createServer(app)
    , io = socket.listen(server)
    , port = process.env.PORT || 8080
    , db_data = {
        server: process.env.DB_SERVER || '127.0.0.1',
        port: process.env.DB_PORT || 27017
      };

  var MongoServer = mongo.Server
    , MongoDb = mongo.Db;

  var mongo_server = new MongoServer(db_data.server, db_data.port, {auto_reconnect: true});
  var db = new MongoDb('catanode-users', mongo_server).open(function( err, client ) {
    app.users = new mongo.Collection(client, 'users');

    require('./auth')(passport_local, passport, db);

    app.configure(function() {
      app.engine('html', jade.renderFile);
      app.set('view engine', 'jade');
      app.set('views', __dirname + '/views');
      app.use(express.static(__dirname + "/public/"));
      app.use(express.cookieParser('testcookieparser'));
      app.use(express.session({ cookie: { maxAge: 60000 }}));
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.logger());
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(flash());
      app.use(app.router);
    });

    require("./sockets")(app, io, gameserver, passport);
    require("./routes")(app, io, gameserver, passport);

    server.listen(port);
    console.log( "Server running at port: " + port);
  });
});
