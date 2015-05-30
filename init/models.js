module.exports = function(cb){

  var Backbone  = require("backbone");
  Backbone.sync = function(method, model, options){
    
    function callback(err, result){
      if(err) return options.error(err);
      options.success(result);
    }

    options || (options = {});
    switch (method) {
      case 'create':
        env.do(model.dataPath+".create", [model.toJSON(), options], callback); break;
      case 'update':
        env.do(model.dataPath+".update", [model.toJSON(), options], callback); break;
      case 'delete':
        env.do(model.dataPath+".delete", [model.toJSON(), options], callback); break;
      case 'read':
        var dataPath = ( model.models? (model.dataPath || model.model.prototype.dataPath) : model.dataPath );
        var path = (model.models?".find":"findOne");
        var pattern = options.pattern || model.id?{_id:model.id}:(!model.models?model.toJSON():{});
        env.do( dataPath+path ,   [pattern, options], callback); break;
    }
  };

  var env = this;
  this.structureLoader("models", null, cb );
};
