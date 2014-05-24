
var _ = require("underscore");

module.exports = function(cb){

  var env = this, config = this.config;

  var Class = require("../tools/Class");
  var Backbone = require("backbone");
  
  Backbone.Model.__className = "Class_Model";
  Backbone.Model.extend = Class.extend;
  console.log(1);
  Backbone.Collection.__className = "Class_Collection";
  Backbone.Collection.extend = Class.extend;

  _.extend(env, {

    Class:              Class,
    EventedClass:       require("../tools/EventedClass"),
    
    Model:              Backbone.Model,
    AdvancedModel:      require("../tools/AdvancedModel"),
    
    Collection:         Backbone.Collection,
    AdvancedCollection: require("../tools/AdvancedCollection"),
    
    Controller:         require("../tools/Controller"),
    Page:               require("../tools/Page"),

    helpers:{
      
      isInstanceOf:       function(protos){
        if(_.isArray(protos)) 
          return function(v){ return _.some(protos, function(P){return v instanceof P;});};
        else 
          return function(val){return val instanceof protos;};
      }

    }

  });


  cb();
}