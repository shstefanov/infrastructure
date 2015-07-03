

module.exports = function(cb){
  
  if(!this.config.http) return cb();

  var express        = require('express'                );
  var http           = require('http'                   );
  var path           = require('path'                   );
  var express        = require("express"                );
  var methodOverride = require('method-override'        );
  var bodyParser     = require('body-parser'            );
  // var session        = require('express-session'        );
  var morgan         = require('morgan'                 );
  // var MongoStore     = require('connect-mongo') (session);
  var socketio       = require("socket.io"              );
  // var SessionSockets = require('session.socket.io'      );
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
  
  app.use(bodyParser());
  app.use(methodOverride());
  
  var CookieParser, cookieParser;
  if(config.session){
    CookieParser = require( 'cookie-parser' );
    cookieParser = CookieParser(config.session.secret);
    app.use(cookieParser);
    env.i.do("log.sys", "CookiePrser", "Cookie: "+config.session.secret);
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
    env.i.do("log.sys", "MongoStore", "Collection: "+config.session.collection+" Cookie: "+config.session.secret);
  }
  
  if(config.statis){
    for(route in config.statis){
      app.use(route, express.static(path.join(config.rootDir, config.statis[route])));
      env.i.do("log.sys", "static", route+" -> "+config.statis[route]);
    }    
  }
  
  env.engines.express = app;
  var server = http.createServer(app).listen(app.get('port'), function(err){
    if(err) return cb(err);
    env.i.do("log.sys", "http", 'Express server listening on port ' + app.get('port'));
    if(!config.websocket) return cb();
    if(session && sessionStore && env.socketConnection){
      var SessionSockets = require( 'session.socket.io' );
      var io = socketio.listen(server);
      var sio = new SessionSockets(io, sessionStore, cookieParser);
      sio.on("connection", env.socketConnection);
      env.i.do("log.sys", "websocket", 'socket.io listening on port ' + app.get('port'));
      cb();
    }
    else {
      cb();
    }
  });

};
