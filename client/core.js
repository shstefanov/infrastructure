window.$                    = require("./lib/jquery-2.0.0.min.js")
, _                         = require("underscore")
, async                     = require("async")
, Backbone                  = require("backbone")
, Backbone.$                = $;

_.mixin(require("./init/mixins"));

window.App = {
  settings:                 {
    routePrefix: ""
  },

  View:                     require("./base/view.coffee"),
  Router:                   require("./base/router.coffee"),
  Model:                    require("./base/model.coffee"),
  Collection:               Backbone.Collection.extend(require("./base/collection.coffee")),
  Models:                   {},
  Collections:              {},
  Views:                    {}
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
     console.log("here 3");
    if(err) throw new Error(err);
    Backbone.history.start({pushState:true, trigger:true});
  };

  var prepare = function(){
    if(typeof module.prepare == "function")   module.prepare(start);
    else                                      start();
  };

  var initialized = false;
  app.socket.on("error", function(err ){
    alert("Error: see console"); console.log(err);
  });
  app.socket.on("ready", function(data){
    if(initialized) return;
    initialized = true;






    console.log("ready sygnal");
    console.log(data);
    console.log("pluginsMap: ", pluginsMap );
    return;
    var buildModelsStage = function(){
      require("./init/initModels")(data.schemas, prepare); 
    };
    
    require("./init/initServices")(data.services, function(){
      //Check if module is regular router or complex view-router tree
      if     (module.routes) require("./init/initRegularApp")(module, buildModelsStage);
      else if(module.router) require("./init/initComplexApp")(module, buildModelsStage);
    }); 


  });

 
};
