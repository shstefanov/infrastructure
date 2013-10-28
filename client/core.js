window.$                    = require("./lib/jquery-2.0.0.min.js")
, _                         = require("underscore")
, async                     = require("async")
, Backbone                  = require("backbone")
, Backbone.$                = $;

_.mixin(require("./init/mixins"));

async.simpleCompose = function (fns) {
  return function () {
    var that = this;
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    async.reduce(fns, args, function (newargs, fn, cb) {
      fn.apply(that, newargs.concat([function () {
        var err = arguments[0];
        var nextargs = Array.prototype.slice.call(arguments, 1);
        cb(err, nextargs);
      }]))
    },
    function (err, results) {
        callback.apply(that, [err].concat(results));
    });
  };
};

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


//Adding services plugin
addPlugin("services", function(services, cb){
  require("./init/initServices")(services, function(){
    cb(null, services);
  });
});

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

  app.socket.on("error", function(err ){
    alert("Error: see console (error from server)"); console.log(err);
  });
  var initialized = false;
  app.socket.on("ready", function(readyData){
    if(initialized) return;
    initialized = true;

    //Composing pluginsMap
    pluginsMap = _.mapObject(pluginsMap, function(key, fns){
      return async.simpleCompose(fns);
    });

    var counter = Object.keys(pluginsMap).length;
    var checkReady = function(){
      counter--;
      if(counter==0){
        require("./init/initRegularApp")(module, prepare);
      }
    };

    for(key in pluginsMap){
      pluginsMap[key](readyData[key], function(err, part){
        if(err) throw new Error(err);
        else
          checkReady();
      });
    }

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
