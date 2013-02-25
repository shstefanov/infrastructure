var BaseCollection = require("./collections/BaseCollection.js");
var BaseModel = require("./models/BaseModel");

var Service = require("./services/service.coffee");

window.dispatcher = _.extend({}, Backbone.Events);

require("./init/i18next");

require("./init/view.coffee");
require("./init/model.coffee");
require("./init/collection.coffee");


window.App = function(router_options){

  var self = this;

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
      //Here runs the application
      self.router = new appRouter();
      if(router_options.routes)
        Backbone.history.start();
    }));
  });



  // //Set up collections
  // for(modelName in __models){
  //   var name = modelName;
  //   self.collections[name] = new BaseCollection.extend({
  //     name:name,
  //     model: new BaseModel(__models[name])
  //   });
  // }

  // var handleModel = function(modelData){
  //   self.collections[model.name].get(model._id).set(modelData);
  // };
  // //When models data comming trough socket
  // this.socket.on("db", function(data){
  //   typeof data.body == "array"? data.forEach(handleModel) : handleModel(data);
  // });

};

