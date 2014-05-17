
var _ = require("underscore");

module.exports = function(cb){

  var env = this, config = this.config;

  var Class = require("../tools/Class");
  var Backbone = require("backbone");
  
  Backbone.Model.__className = "Class_Model";
  Backbone.Model.extend = Class.extend;

  Backbone.Collection.__className = "Class_Collection";
  Backbone.Collection.extend = Class.extend;

  _.extend(env, {
    Class:              Class,
    EventedClass:       require("../tools/EventedClass"),
    Model:              Backbone.Model,
    Collection:         Backbone.Collection,
    AdvancedCollection: require("../tools/AdvancedCollection"),
    Controller:         require("../tools/Controller"),
    Page:               require("../tools/Page"),
    SocketsCollection:  require("../tools/SocketsCollection")
  });


  cb();
}