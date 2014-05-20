

var express = require('express');

var http = require('http');
var path = require('path');

var express = require("express");

var methodOverride = require('method-override')
var bodyParser = require('body-parser')
var favicon = require('serve-favicon');
var CookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var socketio = require("socket.io");
var SessionSockets = require('session.socket.io');

var _ = require("underscore");


// all environments

module.exports = function(cb){

  var env = this;

  var config = env.config;
  var app = express();
  

  app.set('port', process.env.PORT || config.port || 3000);
  app.set('views', path.join(config.rootDir, config.templates));

  app.set('view engine', 'jade');
  
  config.favicon && app.use(favicon(path.join(config.rootDir, config.favicon)));
  

  // Deprecated - see https://github.com/senchalabs/connect#middleware for alternatives
  //app.use(express.logger('dev'));
  //app.use(express.json());
  app.use(bodyParser());
  app.use(methodOverride());
  var cookieParser = CookieParser(config.session.cookie.name);
  app.use(cookieParser);
  
  // https://github.com/expressjs/cookie-session
  var sessionStore = new MongoStore(_.extend({db:env.db}, config.session));
  app.use(session({
    secret: config.session.cookie.name,
    store: sessionStore
  }));
  // app.use(session({
  //   secret: config.sessionCookie,
  //   store: sessionStore
  // }));
  
  // Deprecated
  //app.use(app.router);
  
  if(config.public && _.isObject(config.public)){
    for(route in config.public){
      var folderpath = config.public[route];
      app.use(route, express.static(path.join(config.rootDir, folderpath)));
    }
  }
  else{
    app.use(config.publicRoute || "/public", express.static(path.join(config.rootDir, config.static)));
  }

  var server = http.createServer(app).listen(app.get('port'), function(err){
    var io = socketio.listen(server);
    io.set('log level', 2);
    var sio = new SessionSockets(io, sessionStore, cookieParser);
    sio.on("connection", env.socketConnection);

    console.log('Express server listening on port ' + app.get('port'));
    env.app = app;
    cb(err);
  });

};