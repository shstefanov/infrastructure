var _             = require("underscore");
var Model         = require("./Model");

var ExtendedModel = Model.extend({
  
  constructor: function(data, options){
    if(options && options.fromJSON===true) data = this.convertJSON(data);
    data = data || {};
    this.error = this.validate(data);
    if(this.error) Model.apply(this);
    else Model.call(this, data, options);
  },

  toJSON: function(){
    if(this.error) return {error: this.error};
    return Model.prototype.toJSON.apply(this);
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

module.exports            = ExtendedModel;
