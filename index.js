var express = require('express')
  , socketio = require("socket.io")
  , SessionSockets = require('session.socket.io')
  , mongoose = require("mongoose")
  , browserify = require("browserify")
  , http = require('http')
  , path = require('path');

var helpers = require("./helpers");

module.exports = function(config){
  //Connecting to the database first
  var db = mongoose.createConnection(config.db.host, config.db.dbName)
  .on("open", function(){
    //Initializing and setting up express
    var app  = require("./app")(express, config);
    //Initializing and setting http server
    var server = http.createServer(app).listen(config.server.port, config.server.interface, function(){
      console.log("Server running at http://localhost:" + app.get('port'));

      //Initializing socket.io support
      var io = socketio.listen(server);
      io.set("log level", 0);
      var sio = new SessionSockets(io, app.sessionStore, app.cookieParser); //Set in ./app.js


      var services = helpers.loadDirAsObject(config.socketIoServicesFolder);
      io.clientsCount = 0;
      sio.on("connection", require("./socket").connect(app, io, config, services));
    });
  });

};
