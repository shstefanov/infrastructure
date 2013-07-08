var async = require("async");


module.exports = function(express, raw_config, pluginsMap, callback){
  var app = express();


  //Running the config initialization queue
  pluginsMap.config.unshift(function(callback){
    callback(null, raw_config);
  });

  async.waterfall(pluginsMap.config, function(err, config){
    if(err){throw err;}

    app.config = config;

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

      //Default core static resources
      app.use(express.static(__dirname+"/coreLibs"));

      //Additional optional static resources
      if(config.staticFolder){ //
        if(typeof config.staticFolder == "string"){
          app.use(express.static(config.staticFolder));
        }
        else if(Array.isArray(config.staticFolder)){
          config.staticFolder.forEach(function(folderPath){
            app.use(express.static(folderPath));
          });
        }
        else{
          console.log("Warning - can't specifi static folders provided");
        }
      }

      //Additional express configuratopns and middlewares
      if(pluginsMap.configure.length > 0){
        pluginsMap.configure.forEach(function(setup){
          setup(express, app, config);
        });
      }
      
      app.use(app.router); //app.router after express.bodyParser() makes bodyParser working
    });

    //Set up error handler in develop mode
    app.configure('development', function(){
      app.use(express.errorHandler());
    });

    callback(app);
  });

};
