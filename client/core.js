var BaseCollection = require("./collections/BaseCollection.js");
var BaseModel = require("./models/BaseModel");

require("./init/i18next");

window.App = function(router_options){
  var self = this;

  window.socket = io.connect();
  window.socket.on("connect", function(){
    appRouter = Backbone.Router.extend(router_options);
    self.router = new appRouter();
    if(router_options.routes)
      Backbone.history.start();
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

