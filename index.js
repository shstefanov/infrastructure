var express = require('express')
  , socketio = require("socket.io")
  , SessionSockets = require('session.socket.io')
  , Sequelize = require('sequelize')
  , http = require('http')
  , path = require('path');

var helpers = require("./helpers");

var app, config;
//After database connection handler
var dbConnectionHandler = function(models, callback){
  
  //Initializing and setting up express
  var appInitializer = require("./app");
  app = appInitializer(express, config);
  
  app.models = models;

  //Adding the pages
  var routesInitializer = require("./routes");
  routesInitializer(app, config);

  //Setting up bundles
  var bundlesInitializer = require("./bundles");
  bundlesInitializer(app, config);

  app.services = helpers.loadDirAsObject(app.config.socketIoServicesFolder);

  //Initializing and setting http server
  var server = http.createServer(app).listen(config.server.port, config.server.interface, function(){
    console.log("Server running at http://localhost:" + config.server.port);

    //Initializing socket.io support
    var io = socketio.listen(server);
    io.clientsCount = 0;
    io.set("log level", 0);
    var sio = new SessionSockets(io, app.sessionStore, app.cookieParser); //Set in ./app.js

    //Initializing and setting every incoming connection
    socketServicesInitializer = require("./socket").connect;

    sio.on("connection", socketServicesInitializer(app, io, config));
  });
  callback(null, app);
};


module.exports = {

  run:function(_config, callback){
    config = _config;
    var sq = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, config.mysql);
    var modelsInitializer = require(config.models);
    modelsInitializer(sq, {
      STRING:  Sequelize.STRING,
      TEXT:    Sequelize.TEXT,
      INTEGER: Sequelize.INTEGER,
      DATE:    Sequelize.DATE,
      BOOLEAN: Sequelize.BOOLEAN,
      FLOAT:   Sequelize.FLOAT
    }, function(models){
      return dbConnectionHandler(models, callback);
    });
  },
  
  seed:function(config, callback){

    config.mysql.define.syncOnAssociation = true;
    config.mysql.sync = { force: true };
    config.mysql.syncOnAssociation = true;
    config.mysql.define = { 
      underscored: config.mysql.define.underscored,
      freezeTableName: config.mysql.define.freezeTableName,
      syncOnAssociation: true,
      charset: config.mysql.define.charset,
      collate: config.mysql.define.collate,
      classMethods: config.mysql.define.classMethods,
      instanceMethods: config.mysql.define.instanceMethods,
      timestamps: config.mysql.define.timestamps
    };

    var sq = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, config.mysql);
    var seeds = require(config.seed);

    var modelsInitializer = require(config.models);
    modelsInitializer(sq, {
      STRING:  Sequelize.STRING,
      TEXT:    Sequelize.TEXT,
      INTEGER: Sequelize.INTEGER,
      DATE:    Sequelize.DATE,
      BOOLEAN: Sequelize.BOOLEAN,
      FLOAT:   Sequelize.FLOAT
    }, function(models){
      var models_count = 0;
      var methods_count = 0;
      sq.drop().success(function(){
        sq.sync({force: true}).success(function(){
          var check_ready = function(){
            if(models_count == 0 && methods_count == 0){ 
                callback(sq, models);
              }
          };
          //Tables created, seeding
          for(model in seeds){
            var m = model;
            if(typeof seeds[m] == "function"){
              methods_count++;
              seeds[m](config, models, function(){
                methods_count--;
                check_ready();
              });
               return;
            }
            
            seeds[m].forEach(function(mo){
              models_count++;
              models[m].create(mo).error(function(err){throw err;})
              .success(function(model){
                models_count--;
                check_ready();
              });
            });
          }
        }).error(function(err){
          throw err;
        });
      });
    });
  }
};
