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
  config: [],       //Work on config object via async waterfall
  configure: [],    // functions runned on app.configure stage
  coreLibs: [],     // corescripts that will be loaded by default
  bundles: [],      // Additional bundles that must be bundled
  assetRenderers:{} //Object with functions that take arrays
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
          else if(key == "assetRenderers"){
            Object.keys(plugin[key]).forEach(function(assetRenderer){
              if(typeof plugin[key][assetRenderer] == "function")
                pluginsMap.assetRenderers[assetRenderer] = plugin[key][assetRenderer]
            });
          }
          else{ 
            if(Array.isArray(plugin[key])){
              plugin[key].forEach(function(p_k){
                pluginsMap[key].push(p_k); 
              });
            }
            else{
              pluginsMap[key].push(plugin[key]); 
            }
          }
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
    //Check if test is called
    if(process.argv[2] == "test"){
      var tester = require("./test.js");
      var defaultTests = config.tests? config.tests : process.cwd()+"/tests"; 
      var target = process.argv[3]? (process.cwd()+"/"+process.argv[3]) : defaultTests;
      tester(target , config.testOptions);
      return;
    }

    //Initializing and setting up express
    require("./app")(express, config, pluginsMap, function(app){

      app.config = config;
      app.options = require("./options.js");
      app.pluginsMap = pluginsMap;

      //Initializing some features and extending the app
      require("./lib")(app);

      //Setting up bundles
      require("./bundles")(app, config, pluginsMap);
      
      //Adding the pages
      var coreLibs = [ "/socket.io/socket.io.js"  ];
      app.pluginsMap.coreLibs.forEach(function(lib){ coreLibs.push(lib); });
      if(config.routes)  require("./lib/routes") (app, config, coreLibs);
      if(config.routers) require("./lib/routers.coffee")(app, config, coreLibs);


      if(config.servicesFolder && fs.existsSync(config.servicesFolder)){
        app.services = helpers.loadDirAsObject(app.config.servicesFolder);
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
        sio.on("connection", socketServicesInitializer(app, io, config, function(){
        }));

      });
    });
  }
};
