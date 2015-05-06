io = require("../socket");

App.EventedClass = require("../../tools/EventedClass");
App.Controller   = require("../backbone/controller.js");

if(window.config && window.config.websocket){
  socket = io.connect(window.location.origin, config.websocket);
}
else{
  socket = io.connect();    

}

var initData;
App.run = function(props){
  if(!socket.socket.connected){
    socket = io.connect()
    .on("connect", function(){
      setTimeout(function(){
        socket.emit("init", config.root, function(err, data){
          if(err) return console.error(err);
          initData = data;
          App.run(props);
        });
      }, 100);
    });
    return;
  }

  require("angular/lib/angular.js");
  angular = ng = window.angular;
  require("ui-router");

  app = angular
  .module((props.name || "infrastructureApp"), (props.dependencies||[]).concat(['ui.router']))
  .factory("socket", function(){
    return socket;
  });

  var controllers = {};
  for(name in initData){ var methods = initData[name];
    if(methods.error) { console.error(methods.error); continue; }
    controllers[name] = new App.Controller(name, methods);
    
    // Setting up every controller as service with it's own name
    (function(name, controller){
      app.factory("controllers."+name, function(){
        return controller;
      })
    })(name, controllers[name])
  }

  app.factory("controllers", function(){
    return controllers;
  });


  for(var key in props){
    switch(key){
      case "config":
        app.config(props[key]);
        break;
      case "routes":
        app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){
          if(props.defaultRoute){
            $urlRouterProvider.otherwise(props.defaultRoute);
          }
          for(var routePath in props.routes){
            var route = props.routes[routePath];
            if(!route.url) route.url = ("/"+routePath).replace(/^\/{2,}/, "/");
            $stateProvider
            .state(routePath.replace(/^\//, ""), route)
          }

        }]);
        break;
    }
  }



}



