/*
  app.socket,
  app.collections[name] - hash with Backbone collections, holding available models




*/

var files = require("./files");
var BaseCollection = require("./collections/BaseCollection.js");
var BaseModel = require("./models/BaseModel");


window.App = function(){
  var self = this;
  this.socket = io.connect();

  //Set up collections
  for(modelName in __models){
    var name = modelName;
    self.collections[name] = new BaseCollection.extend({
      name:name,
      model: new BaseModel(__models[name]);
    });
  }

  var handleModel = function(modelData){
    self.collections[model.name].get(model._id).set(modelData);
  };
  //When models data comming trough socket
  socket.on("db", function(data){
    typeof data.body == "array"? data.forEach(handleModel) : handleModel(data);
  });

};
