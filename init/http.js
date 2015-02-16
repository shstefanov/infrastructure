var express        = require('express'                );
var http           = require('http'                   );
var path           = require('path'                   );
var express        = require("express"                );
var methodOverride = require('method-override'        );
var bodyParser     = require('body-parser'            );
var favicon        = require('serve-favicon'          );
var CookieParser   = require('cookie-parser'          );
var session        = require('express-session'        );
var morgan         = require('morgan'                 );
var MongoStore     = require('connect-mongo') (session);
var socketio       = require("socket.io"              );
var SessionSockets = require('session.socket.io'      );
var _              = require("underscore"             );


module.exports = function(cb){

  var env     = this;
  var app     = express();
  var config  = env.config;

  app.set('port',  config.port || process.env.PORT || 3000);
  app.set('views', path.join(config.rootDir, config.templates));
  app.set('view engine', 'jade');
  
  config.favicon && app.use(favicon(path.join(config.rootDir, config.favicon)));

  if(config.morgan){
    !Array.isArray(config.morgan)?app.use(morgan(config.morgan)):config.morgan.forEach(function(opt){app.use(morgan(opt));});
  }
  app.use(bodyParser());
  app.use(methodOverride());
  var cookieParser = CookieParser(config.session.secret);
  app.use(cookieParser);
  
  // https://github.com/expressjs/cookie-session
  var sessionStore = new MongoStore(_.extend({db:env.db}, config.session));

  app.use(session({
    resave:            config.session.resave || true,
    saveUninitialized: config.session.saveUninitialized || true,
    secret:            config.session.secret,
    store:             sessionStore
  }));
  
  if(config.statis){
    for(route in config.statis){
      app.use(route, express.static(path.join(config.rootDir, config.statis[route])));
    }    
  }
  
  var server = http.createServer(app).listen(app.get('port'), function(err){
    if(err) return cb(err);
    var io = socketio.listen(server);
    io.set('log level', config.log || 0);
    var sio = new SessionSockets(io, sessionStore, cookieParser);
    sio.on("connection", env.socketConnection);
    env.sys("init", 'Express server listening on port ' + app.get('port'));
    env.app = app;
    cb();
  });

};