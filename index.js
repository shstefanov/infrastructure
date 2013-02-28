var express = require('express')
  , socketio = require("socket.io")
  , SessionSockets = require('session.socket.io')
  , orm = require('orm')
  , http = require('http')
  , path = require('path');

var app, config;
//After database connection handler
var dbConnectionHandler = function(err, db){
  if(err) throw err;
  
  //Initializing and setting up express
  var appInitializer = require("./app");
  app = appInitializer(express, config);
  app.db = db;
  
  //Adding the pages
  var routesInitializer = require("./routes");
  routesInitializer(app, config);

  //Initializing models
  var modelsInitializer = require("./models.js");
  modelsInitializer(app, config);

  //Setting up bundles
  var bundlesInitializer = require("./bundles");
  bundlesInitializer(app, config);

  //Setting up less middleware setup
  var lessInitializer = require("./less.js");
  lessInitializer(app, config);


  //Initializing and setting http server
  var server = http.createServer(app).listen(config.server.port, config.server.interface, function(){
    console.log("Server running at http://localhost:" + app.get('port'));

    //Initializing socket.io support
    var io = socketio.listen(server);
    io.clientsCount = 0;
    io.set("log level", 0);
    var sio = new SessionSockets(io, app.sessionStore, app.cookieParser); //Set in ./app.js

    //Initializing and setting every incoming connection
    socketServicesInitializer = require("./socket").connect;

    sio.on("connection", socketServicesInitializer(app, io, config));
  });
};


module.exports = function(_config, callback){
  config = _config;
  var mysql_connection = "mysql://"+config.mysql.user+":"+config.mysql.password+"@"+config.mysql.host+"/"+config.mysql.database;
  orm.connect(mysql_connection, dbConnectionHandler);
};
