var _ = require("underscore");
var path = require("path");
var browserify = require("browserify");

var helpers = require("./helpers");

var plainTextContentWrapper = function(body, file){
  var prepend = "module.exports = \n";
  var line_beginning = "\"";
  var line_ending = "\"+\n";
  var append = ";\n";
  var lines = body.split("\n");
  var mod = _.map(lines, function(line){return line_beginning+line+line_ending;});
  var code = prepend+mod.join("")+append;
  code = code.replace("+\n;", ";");
  return code;
};

module.exports = function(app, express, config){
  var MongoStore = require('connect-mongo')(express);
  var bundles = helpers.loadDirAsArray(config.bundlesFolder);
  var pages = helpers.loadDirAsArray(config.routesFolder);


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
    app.set('view engine', 'jade');
    app.set('views', config.templatesFolder);

    //Advanced configuration
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());

    //Setting up sessions
    app.use(express.session({
      secret: config.sessionSecretCookie,
      store: sessionStore
    }));

    //Set static file server
    app.use(express.static(config.staticFolder));

    //Set up javascript bundles
    bundles.forEach(function(bundle){
      var count = false;
      var bundler = browserify(path.join(bundle.entryPoint),{
        mount: bundle.mountPoint || bundle._filename,
        watch: bundle.watch || config.bundles.watch,
        cache: bundle.cache || config.bundles.cache
      });
      if(bundle.loadTemplates){
        if(typeof bundle.loadTemplates == "string")
          bundler.register(bundle.loadTemplates, plainTextContentWrapper);
        if(typeof bundle.loadTemplates == "object")
          bundle.loadTemplates.forEach(function(ext){
            if(typeof ext != "string") throw new Error("template extension must be a string");
            bundler.register(ext, plainTextContentWrapper);
          });
      }
      bundler.require(bundle.entryPoint);
      app.use(bundler);
    });

    //Setting up logger
    app.use(express.logger('dev'));
  });

  //Set up error handler in develop mode
  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  //Adding the pages
  require("./routes")(app, pages, bundles);

  return app;
};
