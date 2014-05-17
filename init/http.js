

var express = require('express');

var http = require('http');
var path = require('path');

var express = require("express");
var MongoStore = require('connect-mongo')(express);

var socketio = require("socket.io");
var SessionSockets = require('session.socket.io');

var _ = require("underscore");


// all environments

module.exports = function(cb){

  var env = this;

  var config = env.config;
  var app = express();
  
  var sessionStore = new MongoStore({db: config.mongoStoreSesssionDb});
  var cookieParser = express.cookieParser(config.sessionCookie);

  app.set('port', process.env.PORT || config.port || 3000);
  app.set('views', path.join(config.rootDir, config.templates));

  app.set('view engine', 'jade');
  
  config.favicon && app.use(express.favicon(path.join(config.rootDir, config.favicon)));
  //app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  
  app.use(express.session({
    secret: config.sessionCookie,
    store: sessionStore
  }));
  
  app.use(app.router);
  
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