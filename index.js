var express = require('express')
  , socketio = require("socket.io")
  , SessionSockets = require('session.socket.io')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , coffeescript = require("coffee-script")
  , async = require('async');

var helpers = require("./helpers");

var configurations = [];

pluginsMap = {
  config: [],
  configure: []
}

module.exports = {

  configure: function(conf_func){
    pluginsMap.configure.push(conf_func);
  },

  use: function(plugins){
    var handle = function(plugin){
      for(key in pluginsMap){
        if(plugin[key]){
          if(Array.isArray(plugin[key])){
            plugin[key].forEach(function(handler){
              pluginsMap[key].push(handler);
            });
          }
          else{ pluginsMap[key].push(plugin[key]); }
        }
      }
    };

    if(Array.isArray(plugins)){
      plugins.forEach(function(p){
        handle(p);
      });
    }
    else{
      handle(plugins);
    }

  },

  run: function(config, extensions, callback){
  
    //Initializing and setting up express
    var appInitializer = require("./app");
    appInitializer(express, config, pluginsMap, function(app){

      console.log("here------------------------>2");

      //Adding the pages
      if(config.routes){
        var routesInitializer = require("./routes");
        routesInitializer(app, config);
      }
      console.log("here------------------------>3");
      //Setting up bundles
      if(config.bundles && fs.existsSync(config.bundles)){
        var bundlesInitializer = require("./bundles");
        bundlesInitializer(app, config);
      }
      console.log("here------------------------>4");
      if(config.services && fs.existsSync(config.bundles)){
        app.services = helpers.loadDirAsObject(app.config.services);
      }
      
      //Extending the app with your extensions
      for(key in extensions){
        if(app[key]){
          throw new Error("Can't assign extension <"+key+"> to app - already exist!");
        }
        else{
          app[key] = extensions[key];
        }
      }

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

        callback(null, app);
      });
    });
    
  }

};
