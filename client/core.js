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
        if(self.router.routes)
          Backbone.history.start({pushState:true, trigger:true});
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



