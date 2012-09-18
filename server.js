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
  'mongodb'
  'socket.io', 
  'jade',
  'gameserver',
  'util'
], function(http, _, backbone, express, flash, passport, passport_local, mongo, socket, jade, gameserver, util) {
  var app = express()
    , server = http.createServer(app)
    , io = socket.listen(server)
    , port = process.env.PORT || 8080;

  var MongoServer = mongo.Server
    , Db = mongo.db;

  var mongo_server = new MongoServer('localhost', 27017, {auto_reconnect: true})
    , db = new Db('catanode_users', server);

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
