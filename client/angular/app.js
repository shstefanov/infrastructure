io = require("../socket");

require("angular/lib/angular.js");
angular = ng = window.angular;
require("ui-router");

App.run = function(props){
  app = angular
  .module((props.name || "infrastructureApp"), (props.dependencies||[]).concat(['ui.router']))

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



