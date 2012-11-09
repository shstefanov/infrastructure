var _ = require("underscore");
var path = require("path");
var browserify = require(__dirname+"/modified_modules/browserify");
var walk = require("walk");
var colors = require("colors");

var helpers = require("./helpers");

//To be moved in helpers file
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

module.exports = function(express, config){
  var app = express();

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

    //Set static file server
    app.use(express.static(config.staticFolder));

    //Client initializer bundle 
    //With browserify modification to include files runtime from given strings
    //Needs all directory to be loaded recursively in separate file

    var clientInitializer = browserify({
      mount: "/client_init.js",
      watch: config.bundles.watch,
      cache: config.bundles.cache
    });
    var files = [];
    var walker  = walk.walk(__dirname+'/client', { followLinks: false });

    var clientDir = "/client";
    walker.on('file', function(root, stat, next) {
      // Add this file to the list of files
      clientInitializer.require(root+"/"+stat.name);
      file = (root+"/"+stat.name).replace(__dirname+clientDir, ".");
      files.push(file);
      next();
    });
    
    walker.on("end", function(){
      clientInitializer.addEntry(__dirname+"/client/client_init.js");
      _.map(files, function(file){
        return file.replace(__dirname, ".");
      });
      clientInitializer.prepend("__filelist = "+JSON.stringify(files)+";");
      app.use(clientInitializer);
    });

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

    //less middleware setup
    require("./less.js")(app, config);

    //Setting up logger
    app.use(express.logger('dev'));
  });

  //Set up error handler in develop mode
  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  //Adding the pages
  require("./routes")(app, pages, config);

  return app;
};
