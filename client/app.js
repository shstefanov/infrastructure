jade                            = require("jade/lib/runtime");
io                              = require("./socket");
_                               = require("underscore");
$                               = require("./jquery");
Backbone                        = require("backbone");
Backbone.$                      = $;

require("./mixins");

function set_app (){ app = this; Backbone.Router.apply(this, arguments); }
var Router                      = Backbone.Router.extend({constructor:set_app});

var Class                       = require("../tools/Class");
Backbone.Model.__className      = "Class_Model";
Backbone.Collection.__className = "Class_Collection";
Backbone.View.__className       = "Class_View";
Router.__className              = "Class_Router";
Backbone.Model.extend           = Class.extend;
Backbone.Collection.extend      = Class.extend;
Backbone.View.extend            = Class.extend;
Router.extend                   = Class.extend;

_.extend(App, {
  Class:                        Class,
  EventedClass:                 require("../tools/EventedClass"),
  Model:                        Backbone.Model,
  Collection:                   Backbone.Collection,
  View:                         Backbone.View,
  Router:                       Router
});

_.extend(App, {
  AdvancedCollection:           require("../tools/AdvancedCollection"),
  AdvancedView:                 require("./AdvancedView"),
  AdvancedRouter:               require("./router")  
});

_.extend(App, {
  Window:                       require("./window"),
  Layout:                       require("./layout"),
  Controls:                     require("./controls"),
  Controller:                   require("./controller")
});

App.run = function(Router, cb){
  app = Router.prototype;

  // router.settings = window.settings, 
  Router.prototype.config      = _.clone(window.config);
  Router.prototype.settings    = settings;
  
  function start(){
    Router.prototype.layout = new (Router.prototype.layout || App.Layout)();
    if(typeof Router.build === "function") Router.build();
    app = new Router();
  };

  socket = io.connect().on("connect", function(){
    setTimeout(function(){
      socket.emit("init", config.root, function(err, initData){
        if(err) return console.log(err);
        // {
        //   "controllerName": [... methods ...]
        // }
        console.log("Socket connected");
        var controllers = app.controllers = Router.prototype.controllers = {};
        for(name in initData){ var methods = initData[name];
          if(methods.error) { console.log(init.error); continue; }
          Router.prototype.controllers[name] = new App.Controller(name, methods);
        }
        
        $(_.once(start));
        app.trigger("start");
        
        Backbone.history.start({pushState:true});

      });
    }, 100);
  });



};