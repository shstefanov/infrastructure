var Service = require("./services/service.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");



window.App = {};
App.Modules = {};

App.build = function(router_options){
  console.log("build:");

  var self = this;

  this.dispatcher = _.extend({}, Backbone.Events);

  this.socket = io.connect();
  this.socket.on("connect", function(){
    //Creating services objects

    //When session is loaded, server emits ready signal
    //Then running all other staff
    console.log("before ready");
    self.socket.on("ready", function(data){
      self.services = {};
      services.forEach(function(service_name){
        self.services[service_name] = new Service(service_name);
      });
      console.log("ready");
      appRouter = Backbone.Router.extend(router_options);
      //Now -  running the application
      self.router = new appRouter();
      if(router_options.routes)
        Backbone.history.start();

      console.log("core:self",self);
      for (mod in App.Modules){
        console.log(self.modules[mod])
      }
    });
    this.socket.on("redirect", this.redirect);
  });

  window.app = this;

};

App.View = require("./init/view.coffee");
App.Model = require("./init/model.coffee");
App.Collection = require("./init/collection.coffee");
App.Router = require("./init/router.coffee");

window.App.build.prototype.redirect = function(page){
  window.location.href = page;
}


