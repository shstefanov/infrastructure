var _             = require("underscore");
var Model         = require("./Model");

var ExtendedModel = Model.extend("ExtendedModel", {
  
  constructor: function(data, options){
    if(options && options.fromJSON===true) data = this.convertJSON(data);
    Model.call(this, data, options);
    data = data || {};
    // this.validate(data);
  },

  toJSON: function(){
    if(this.error) return {error: this.error};
    return Model.prototype.toJSON.apply(this);
  },

  validate: function(obj){

    delete this.error;
    if(!this.validation) return;
    if(!obj) { obj = _.clone(this.attributes || {}); }
    var validation = this.validation;
    var error, err = false, props, self = this;
    error = _.mapObject(this.isNew() ? _.omit(validation, [this.idAttribute]) : validation, function(comparator, key){
      if     (!_.has(obj, key))      { err = true; return "missing"; }
      else if(!comparator(obj[key])) { err = true; return "invalid"; }
    });

    for(var key in error) if(_.isUndefined(error[key]) )  delete error[key];
    for(var key in obj)   if(!_.has(validation, key)   )  { err = true; error[key] = "redundant"; }
   
    if(err) {
      this.error = error;
      return error;
    }
  },

});

module.exports            = ExtendedModel;
