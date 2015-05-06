var _             = require("underscore");
var Class         = require("./Class");
var Backbone      = require("backbone");

var ExtendedModel = Backbone.Model.extend({
  
  constructor: function(data, options){
    if(options && options.fromJSON===true) data = this.convertJSON(data);
    data = data || {};
    this.error = this.validate(data);
    if(this.error) Backbone.Model.apply(this);
    else Backbone.Model.call(this, data, options);
  },

  convertJSON: function(data){
    var result = _.clone(data);
    var conv = this.fromJSON || {};
    if(!conv) return result;
    for(var key in result){
      if(conv[key]) {
        result[key] = Array.isArray(data[key])? data[key].map(conv[key]) : conv[key](data[key]);
      }
    }
    return result;
  },

  toJSON: function(){
    if(this.error) return {error: this.error};
    return Backbone.Model.prototype.toJSON.apply(this);
  },

  set: function(data, options){
    delete this.error;
    if(options && options.fromJSON===true) data = this.convertJSON(data);
    this.error = this.validate(_.extend({}, this.attributes, data));
    if(this.error) return this;    
    else Backbone.Model.prototype.set.call(this, data, options);
  },

  validate: function(obj){ // all - true/false
    delete this.error;
    if(!this.validation) return;
    if(!obj) {this.error = "Invalid model"; return;}
    var error = {}, err = false, props, validation = this.validation;
    for(var key in validation){
      if(key==="_id" && this.isNew===true) continue;
      if(!validation[key](obj[key])){
        err = true;
        error[key] = "invalid";
      }
    }
    // Check for unwanted properties
    for(var key in obj){

      if(!validation[key]){
        err = true;
        error[key] = "unwanted";
      }
    }
    if(err){
      this.error = error;
      return error;
    }
  }

});

ExtendedModel.__className = "Class_Model_ExtendedModel";
ExtendedModel.extend      = Class.extend;

module.exports            = ExtendedModel;
