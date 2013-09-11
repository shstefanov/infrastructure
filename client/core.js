window.$                    = require("./lib/jquery-2.0.0.min.js")
, _                         = require("underscore")
, Backbone                  = require("backbone")
, Backbone.$                = $;

window.App = {
  View:                     require("./base/view.coffee"),
  Router:                   require("./base/router.coffee"),
  Model:                    require("./base/model.coffee"),
  Collection:               Backbone.Collection.extend(require("./base/collection.coffee"))
};
console.log(App);

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

  var prepare = function(){
    if(typeof module.prepare == "function")   module.prepare(start);
    else                                      start();
  };

  app.socket.on("ready", function(services){ 
    require("./init/initServices")(services, function(){
      //Check if module is regular router or complex view-router tree
      if     (module.routes) require("./init/initRegularApp")(module, prepare);
      else if(module.router) require("./init/initComplexApp")(module, prepare);
    }); 
  });
};
