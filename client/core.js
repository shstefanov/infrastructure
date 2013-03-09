var Service = require("./tools/service.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");

require("./init/sync.js");


window.App = {};
App.Modules = {};
App.Models = {};
App.Views = {};
App.Collections = {};



App.build = function(router){

  var self = this;
  window.app = this;
  
  this.config = config;
  this.modules = {};
  this.collections = {};
  

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
  self.socket.on("ready", function(data){
    ready = true;
   
    $(document).ready(function(){
      
      //Creating services objects
      self.services = {};

      //Services is global declarated arry, 
      //set in page route definition
      
      var routes = {};

      //Now -  running the application
      var run = function(){
        self.router = new router();
        Backbone.history.start({pushState:true, trigger:true});
      };

      var defineRoute = function(routeName){
        routes[routeName] = function(){
          self.router.$content.empty();
          self.router.$content.append(self.modules[routeName].show().$el);
        };
        //router_definition[routeName] = 
      };
      
      var buildModules = function(){
        var modules_counter = Object.keys(App.Modules).length;
        if(modules_counter == 0) { run(); return; }
        if(!self.modules) self.modules = {};
        for (mod in App.Modules){
          modules_counter--;
          self.modules[mod] = new App.Modules[mod]();
          //All modules ready - run
          if(modules_counter == 0)
            run();
        }
      };
      
      var makeModels = function(){
        if(App.ModelDefinitions){
          var modelFactory = require("./tools/ModelFactory.js");
          modelFactory(App.ModelDefinitions, buildModules);
        }
        else
          buildModules();
      };

      var servicesCounter = services.length;
      services.forEach(function(service_name){
        self.services[service_name] = new Service(service_name, function(name){
          servicesCounter--;
          if(servicesCounter == 0)
            makeModels();
        });
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

App.Views.EditableView = require("./tools/EditableView.coffee")

App.defaultMissingAttributeValue = null;


