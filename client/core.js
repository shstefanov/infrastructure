window.$                    = require("./lib/jquery-2.0.0.min.js")
, _                         = require("underscore")
, Backbone                  = require("backbone")
, Backbone.$                = $;

window.App = {
  settings:                 {
    routePrefix: ""
  },

  View:                     require("./base/view.coffee"),
  Router:                   require("./base/router.coffee"),
  Model:                    require("./base/model.coffee"),
  Collection:               Backbone.Collection.extend(require("./base/collection.coffee")),
  Models:                   {},
  Collections:              {}
};
// console.log(App);

App.run = function(module){
  window.app = {
    config:                 window.config,
    collections:            {},
    services:               {},
    dispatcher:             _.extend({}, Backbone.Events),
    socket:                 io.connect()
  };

  var start = function(err){
    if(err) throw new Error(err);
    Backbone.history.start({pushState:true, trigger:true});
  };

  var prepare_count = 2; //Waiting for models and services
  var prepare = function(){
    prepare_count--;
    if(prepare_count==0){
      if(typeof module.prepare == "function")   module.prepare(start);
      else                                      start();
    }
  };

  app.socket.on("ready", function(data){ 
    require("./init/initServices")(data.services, function(){
      //Check if module is regular router or complex view-router tree
      if     (module.routes) require("./init/initRegularApp")(module, prepare);
      else if(module.router) require("./init/initComplexApp")(module, prepare);
    }); 

    require("./init/initModels")(data.schemas, prepare); 

  });

 
};
