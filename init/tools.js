
var _ = require("underscore");

module.exports = function(cb){

  var env = this, config = this.config;

  var Class = require("../tools/Class");
  var Backbone = require("backbone");
  
  Backbone.Model.__className      = "Class_Model";
  Backbone.Collection.__className = "Class_Collection";
  
  Backbone.Model.extend           = Class.extend;
  Backbone.Collection.extend      = Class.extend;

  _.extend(env, {

    Class:              Class,
    EventedClass:       require("../tools/EventedClass"),
    
    Model:              Backbone.Model,
    AdvancedModel:      require("../tools/AdvancedModel"),
    
    Collection:         Backbone.Collection,
    AdvancedCollection: require("../tools/AdvancedCollection"),
    
    Controller:         require("../tools/Controller"),
    
    Page:               require("../tools/Page"),
    Api:                require("../tools/Api"),
    Widget:             require("../tools/Widget"),

  });

  cb&&cb();
}