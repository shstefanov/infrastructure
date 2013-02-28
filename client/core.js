var Service = require("./services/service.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");



window.App = function(router_options){

  var self = this;

  this.dispatcher = _.extend({}, Backbone.Events);

  this.socket = io.connect();
  this.socket.on("connect", function(){
    //Creating services objects
    self.services = {};
    config.services.forEach(function(service_name){
      self.services[service_name] = new Service(service_name);
    });

    //When session is loaded, server emits ready signal
    //Then running all other staff
    self.socket.on("ready", _.once(function(data){
      appRouter = Backbone.Router.extend(router_options);
      //Now -  running the application
      self.router = new appRouter();
      if(router_options.routes)
        Backbone.history.start();
    }));
  });

  window.app = this;

  this.View = require("./init/view.coffee");
  this.Model = require("./init/model.coffee");
  this.Collection = require("./init/collection.coffee");

  this.modules = {};

};


