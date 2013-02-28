
module.exports = function(express, config){
  var app = express();

  var MongoStore = require('connect-mongo')(express);

  //Creating session store DB
  var sessionStore = new MongoStore({db: config.mongoStoreSesssionDb});
  app.sessionStore = sessionStore;

  //Get express cookeParser
  app.cookieParser = express.cookieParser(config.sessionCookie);

  //Configuring app
  app.configure(function(){

    //Basic configuration
    app.set('port', config.server.port || 3000);

    //Setting up template engine
    //Server will render only init.jade as system initialization template
    app.set('view engine', 'jade');
    app.set('views', __dirname);
    app.use(express.favicon());

    //Advanced configuration
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());

    //Setting up sessions
    app.use(express.session({
      secret: config.sessionCookie,
      store: sessionStore
    }));

    //Setting up logger
    app.use(express.logger('dev'));

    //Set static file server
    app.use(express.static(config.staticFolder));

    //Set up i18next
    var i18next = require("i18next");
    i18next.init(config.i18next);
    app.use(i18next.handle);
    i18next.registerAppHelper(app);
    i18next.serveClientScript(app)
    .serveDynamicResources(app)
    .serveMissingKeyRoute(app)
    .serveChangeKeyRoute(app)
    .serveRemoveKeyRoute(app);
    
    app.use(app.router); //app.router after express.bodyParser() makes bodyParser working
  });

  //Set up error handler in develop mode
  app.configure('development', function(){
    app.use(express.errorHandler());
  });
  return app;
};
