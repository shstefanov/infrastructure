var ServicesBuilder = require("./tools/serviceBuilder.coffee");
var ModulesBuilder = require("./tools/modulesBuilder.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");

require("./init/sync.js");


window.App = {};

App.Modules = {};
App.Models = {};
App.Views = {};
App.Collections = {};
App.Templates = {};



App.build = function(router){

  var self = this;
  window.app = this;
  
  this.config = config;
  this.modules = {};
  this.collections = {};

  this.screenGroups = {};
  

  this.dispatcher = _.extend({}, Backbone.Events);
  this.socket = io.connect();

  this.redirect = function(page){
    var url = "http://"+window.location.host+page;
    window.location.href = url;
  };
  this.socket.on("redirect", this.redirect);

  //When session is loaded, server emits ready signal
  //Then running all other staff
  var ready = false;
  self.socket.on("ready", function(services){
    //console.log(services);

    if(ready == true) return;
    ready = true;
   
    $(document).ready(function(){

      
      //Creating services objects
      self.services = {};

      //Services is global declarated arry, 
      //set in page route definition
      
      var routes = {};

      //Now -  running the application
      var run = function(){
        console.log("heherere?? run?!?");
        self.router = new router();
        if(self.router.prepare){
          self.router.prepare(function(){
            console.log("prepare callback???")
            if(self.router.routes){
              Backbone.history.start({pushState:true, trigger:true});
            }
          });
        }
        else{
          console.log("prepare callback???");
          if(self.router.routes){
            Backbone.history.start({pushState:true, trigger:true});
          }
        }
      };

      var defineRoute = function(routeName){
        routes[routeName] = function(){
          self.router.$content.empty();
          self.router.$content.append(self.modules[routeName].show().$el);
        };
      };
      
      ServicesBuilder(services, function(){
        ModulesBuilder(App.Modules, run);
      });
    });
  });
  
  // this.socket.on("connect", function(){});
  // this.socket.on("disconnect", function(){});
};

App.View = require("./init/view.coffee");
App.Model = require("./init/model.coffee");
App.Collection = require("./init/collection.coffee");
App.Router = require("./init/router.coffee");

App.View.merge = function(protoProps, staticProps) {
    var parent = this;
    var child;

    //console.log("????????????????",Object.keys(parent.prototype.infrastructure));
    
    if(parent.prototype.infrastructure && protoProps.infrastructure){
      Object.keys(parent.prototype.infrastructure).forEach(function(prop){
        if(!protoProps.infrastructure[prop])
        protoProps.infrastructure[prop] = parent.prototype.infrastructure[prop];
      });
    }

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    _.extend(child, parent, staticProps);
    // Add static properties to the constructor function, if supplied.


    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    console.log("INF", protoProps.infrastructure);
    var Surrogate = function(){ 
      this.constructor = child; 
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };


// var V = App.View.wide({a:5, infrastructure:{something:10}});
// var V2 = V.wide({a:50, infrastructure:{other:222}});
// window.v = new V();
// console.log(window.v);
// window.v2 = new V2();
// console.log(window.v2);
