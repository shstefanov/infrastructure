var Service = require("./services/service.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");



window.App = {};
App.Modules = {};
App.Models = {};
App.Collections = {};

App.build = function(router_options){

  var self = this;

  this.config = config;
  //this.settings = settings;

  this.dispatcher = _.extend({}, Backbone.Events);

  this.socket = io.connect();
  this.socket.on("connect", function(){
    

    //When session is loaded, server emits ready signal
    //Then running all other staff
    self.socket.on("ready", function(data){
      console.log("ready");
      $(document).ready(function(){
        console.log(" document.ready");
        //Creating services objects
        self.services = {};
        services.forEach(function(service_name){
          self.services[service_name] = new Service(service_name);
        });
        appRouter = Backbone.Router.extend(router_options);

        //Now -  running the application
        var run = function(){
          console.log(" run");
          self.router = new appRouter();
          if(router_options.routes)
            Backbone.history.start();
        };

        self.modules = {};
        var modules_counter = 0;
        if(Object.keys(App.Modules).length == 0) run(); //If no modules - run it
        for (mod in App.Modules){ //Modules are backbone views
          console.log("module found:", mod);
          modules_counter++;
          self.modules[mod] = new App.Modules[mod](function(){
            modules_counter--;
            if(modules_counter == 0) run();
          });
        }

      });
    });
    this.socket.on("redirect", this.redirect);
  });

  window.app = this;

};

App.View = require("./init/view.coffee");
App.Model = require("./init/model.coffee");
App.Collection = require("./init/collection.coffee");
App.Router = require("./init/router.coffee");

App.defaultMissingAttributeValue = null;

window.App.build.prototype.redirect = function(page){
  var url = "http://"+window.location.host+page;
  window.location.href = url;
}


