
module.exports = function(express, config){
  var app = express();

  var MongoStore = require('connect-mongo')(express);

  //Creating session store DB
  var sessionStore = new MongoStore({db: config.mongoStoreSesssionDb});
  app.sessionStore = sessionStore;

  //Get express cookeParser
  var cookieParser = express.cookieParser(config.server.cookieName);
  app.cookieParser = cookieParser;

  //Configuring app
  app.configure(function(){

    //Basic configuration
    app.set('port', config.server.port || 3000);
    app.use(app.router);
    app.use(express.favicon());

    //Setting up template engine
    //Server will render only init.jade as system initialization template
    app.set('view engine', 'jade');
    app.set('views', __dirname);

    //Advanced configuration
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());

    //Setting up sessions
    app.use(express.session({
      secret: config.sessionSecretCookie,
      store: sessionStore
    }));

    //Setting up logger
    app.use(express.logger('dev'));

    //Set static file server
    app.use(express.static(config.staticFolder));
  });

  //Set up error handler in develop mode
  app.configure('development', function(){
    app.use(express.errorHandler());
  });
  return app;
};
