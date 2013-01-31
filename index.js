var express = require('express')
  , socketio = require("socket.io")
  , SessionSockets = require('session.socket.io')
  , mongoose = require("mongoose")
  , http = require('http')
  , path = require('path');



module.exports = function(config){

  //Connecting to the database first
  var db = mongoose.createConnection(config.db.host, config.db.dbName)
  .on("open", function(){

    //DB error handler - to console
    db.on('error', console.error.bind(console, 'db connection error:'));

    /*
    Initializing data models
      models = {
        defined:{mongoosemodels}
        schemas:{mongoose schemas} //from config.modelsFolder
    }*/
    var modelsInitializer = require("./models.js");
    var models = modelsInitializer(mongoose, config);

    

    //Initializing and setting up express
    var appInitializer = require("./app");
    var app  = appInitializer(express, config);

    //Setting up bundles
    var bundlesInitializer = require("./bundles");
    bundlesInitializer(app, models.stringified, config);

    //Setting up less middleware setup
    var lessInitializer = require("./less.js");
    lessInitializer(app, config);

    //Adding the pages
    var routesInitializer = require("./routes");
    routesInitializer(app, config);

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
      sio.on("connection", socketServicesInitializer(app, io, config, models));
    });


  });

};
