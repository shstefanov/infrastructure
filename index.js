var express = require('express')
  , socketio = require("socket.io")
  , SessionSockets = require('session.socket.io')
  , Sequelize = require('sequelize')
  , http = require('http')
  , path = require('path');

var app, config, models;
//After database connection handler
var dbConnectionHandler = function(){
  
  //Initializing and setting up express
  var appInitializer = require("./app");
  app = appInitializer(express, config);
  
  app.models = models;

  //Adding the pages
  var routesInitializer = require("./routes");
  routesInitializer(app, config);

  //Initializing models
  //var modelsInitializer = require("./models.js");
  //modelsInitializer(app, config);

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
  return app;
};


module.exports = function(_config, callback){
  config = _config;
  var sq = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, config.mysql);
  var modelsInitializer = require(config.models);
  var seeds = require(config.seed);
  modelsInitializer(sq, {
    STRING:  Sequelize.STRING,
    TEXT:    Sequelize.TEXT,
    INTEGER: Sequelize.INTEGER,
    DATE:    Sequelize.DATE,
    BOOLEAN: Sequelize.BOOLEAN,
    FLOAT:   Sequelize.FLOAT
  }, seeds, function(){
    return dbConnectionHandler();
  });
  
};
