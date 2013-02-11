var BaseCollection = require("./collections/BaseCollection.js");
var BaseModel = require("./models/BaseModel");

require("./init/i18next");

window.App = function(router_options){
  appRouter = Backbone.Router.extend(router_options);
  this.router = new appRouter();
  console.log("initializing app -> router", this.router);
  if(router_options.routes)
    Backbone.history.start();


  var self = this;
  this.socket = io.connect();

  // //Set up collections
  // for(modelName in __models){
  //   var name = modelName;
  //   self.collections[name] = new BaseCollection.extend({
  //     name:name,
  //     model: new BaseModel(__models[name])
  //   });
  // }

  var handleModel = function(modelData){
    self.collections[model.name].get(model._id).set(modelData);
  };
  //When models data comming trough socket
  this.socket.on("db", function(data){
    typeof data.body == "array"? data.forEach(handleModel) : handleModel(data);
  });

};

