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
    , port = process.env.PORT || 8080
    , db_data = {
        server: process.env.DB_SERVER || 'mongodb://localhost',
        port: process.env.DB_PORT || 27017,
        connection: function() {
          return db_data.server + ":" + db_data.port;
        }
      };

  var Db = require('./access-db');

  app.configure(function() {
    app.engine('html', jade.renderFile);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + "/public/"));
    app.use(express.cookieParser('testcookieparser'));
    app.use(express.session({ 
      maxAge: 60000,
      store: mongoStore( db_data.connection() ),
      secret: 'applecake'
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

  var db = new Db.startup( db_data.connection() + "/catanode-users" );
  /* TESTING create user
  Db.saveUser({
    fname: "b-rad", lname: "olson",
    email: "iam@brad.io",
    username: "frbsqasasdasdasdz",
    password: "wibblez"
  });
  */
  Db.getUsers(function(users) {
    users.forEach(function( user ) {
      console.log( user.username );
    });
  })

  require("./sockets")(app, io, gameserver, passport);
  require("./routes")(app, io, gameserver, passport);
  
  console.log( "Database live at: " + db_data.connection() );
  console.log( "Server running at port: " + port);
});
