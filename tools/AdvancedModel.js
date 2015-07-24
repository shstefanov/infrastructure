
var Class = require("./Class");
var Backbone = require("backbone");
var _ = require("underscore");

var AdvancedModel = Backbone.Model.extend({
  
  constructor: function(data, options){
    if(options && options.fromJSON===true) data = this.convertJSON(data);
    data = data || {};
    Backbone.Model.call(this, data, options);
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
    if(options && options.fromJSON===true) data = this.convertJSON(data);
    this.error = this.validate(_.extend({}, this.attributes, data));
    if(this.error) return this;    
    else Backbone.Model.prototype.set.call(this, data, options);
  },

  validate: function(obj){
    delete this.error;
    if(!this.validation) return;
    if(!obj) { obj = _.clone(this.attributes || {}); }
    
    var error, self = this, err = false, props, validation = this.validation;
    error = _.mapObject(validation, function(comparator, key){
      if(self.isNew && key === "_id") return;
      else if   (!_.has(obj, key))      { err = true; return "missing"; }
      else if   (!comparator(obj[key])) { err = true; return "invalid"; }
    });

    for(var key in error) if(_.isUndefined(error[key]) )  delete error[key];
    for(var key in obj)   if(!_.has(validation, key)   )  error[key] = "redundant";
   
    if(err) {
      this.error = error;
      return error;
    }
  },

});
AdvancedModel.__className = "Class_Model_AdvancedModel";
AdvancedModel.extend = Class.extend;

module.exports = AdvancedModel;