

module.exports = function(cb){
  
  if(!this.config.http) return cb();

  var express        = require('express'                );
  var http           = require('http'                   );
  var path           = require('path'                   );
  var express        = require("express"                );
  var methodOverride = require('method-override'        );
  var bodyParser     = require('body-parser'            );
  var morgan         = require('morgan'                 );
  var socketio       = require("socket.io"              );
  var _              = require("underscore"             );

  var env     = this;
  var app     = express();
  var config  = env.config;

  app.set('port',  config.http.port || process.env.HTTP_PORT || 3000);
  app.set('views', path.join(config.rootDir, config.views.path));
  app.set('view engine', config.views.view_engine);
  
  if(config.http.favicon){
    var favicon = require( 'serve-favicon' );
    app.use(favicon(path.join(config.rootDir, config.http.favicon)));
    env.i.do("log.sys", "favicon", "favicon middleware serves: "+config.http.favicon );
  }

  if(config.http.morgan){
    !Array.isArray(config.morgan)?app.use(morgan(config.http.morgan)):config.http.morgan.forEach(function(opt){app.use(morgan(opt));});
    env.i.do("log.sys", "morgan", "morgan logger running");
  }
  
  app.use(methodOverride());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json({extended: true}));
  
  var CookieParser, cookieParser;
  if(config.session){
    CookieParser = require( 'cookie-parser' );
    cookieParser = CookieParser(config.session.secret);
    app.use(cookieParser);
    env.i.do("log.sys", "CookieParser", "Setup cookies ");
  }
  
  var session, sessionStore;
  if(config.session && env.engines.mongodb){
    // https://github.com/expressjs/cookie-session
    var session    = require( 'express-session' );
    var MongoStore = require( 'connect-mongo' )(session);
    sessionStore   = new MongoStore(_.extend({db:env.engines.mongodb}, config.session));
    app.use(session({
      resave:            config.session.resave || true,
      saveUninitialized: config.session.saveUninitialized || true,
      secret:            config.session.secret,
      store:             sessionStore
    }));
    env.i.do("log.sys", "MongoStore", "Collection: "+config.session.collection);
  }
  
  if(config.http.static){
    for(var route in config.http.static){
      var folderPath = path.join(config.rootDir, config.http.static[route]);
      app.use(route, express.static(folderPath));
      env.i.do("log.sys", "http", "Serve static content: "+route+" -> "+folderPath);
    }    
  }
  
  env.engines.express = app;
  var server = http.createServer(app).listen(app.get('port'), function(err){
    if(err) return cb(err);
    env.stops.push(function(cb){ server.close(); cb(); });
    env.i.do("log.sys", "http", 'Express server listening on port ' + app.get('port'));
    cb();
  });

};
