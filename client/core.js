var Service = require("./tools/service.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");

require("./init/sync.js");


window.App = {};
App.Modules = {};
App.Models = {};
App.Collections = {};



App.build = function(router_options){
  console.log("build");

  var self = this;
  window.app = this;
  
  this.config = config;
  this.modules = {};
  this.collections = {};
  this.makeModels = require("./tools/ModelFactory.js");
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
      services.forEach(function(service_name){
        self.services[service_name] = new Service(service_name);
      });
      

      //Now -  running the application
      var run = function(){
        appRouter = App.Router.extend(router_options);
        self.router = new appRouter();
        if(router_options.routes)
          Backbone.history.start();
      };
      
      var modules_counter = Object.keys(App.Modules).length;
      if(modules_counter == 0) { run(); return; }
      if(!router_options.routes) router_options.routes = {};
      if(!self.modules) self.modules = {};
      router_options.moduleNames = [];
      for (mod in App.Modules){ 
        modules_counter--;
        var moduleName = App.Modules[mod].name;
        moduleNames.push(moduleName);
        router_options.routes[moduleName] = function(){
          self.router.$content.empty();
          self.router.$content.append(self.modules[moduleName].show().$el);
        }
        var moduleRoutesWithRootUrl = {};
        for(moduleRoute in App.Modules){
          moduleRoutesWithRootUrl[App.Modules[mod].name + "/" + moduleRoute]= App.Modules[moduleRoute];
        }
        App.Modules.routes = moduleRoutesWithRootUrl;
        self.modules[moduleName] = new App.Router.extend(App.Modules[mod]);

        //All modules ready - run
        if(modules_counter == 0) run();
      
      }
    });
  });
  
  // this.socket.on("connect", function(){});
  // this.socket.on("disconnect", function(){});
};

App.View = require("./init/view.coffee");
App.Model = require("./init/model.coffee");
App.Collection = require("./init/collection.coffee");
App.Router = require("./init/router.coffee");

App.defaultMissingAttributeValue = null;


