module.exports = function(cb){

  var env = this;

  var Backbone  = require("backbone");
  Backbone.sync = function(method, model, options){
    
    function callback(err, result){ err? options.error(err) : options.success(result); }

    var query  = options.query;
    var opts   = options.options;
    var fields = options.fields;

    // options || (options = {});
    switch (method) {
      case 'create':
      case 'update':
      case 'patch':
      case 'delete':
        var target = options.dataPath || ( model.dataPath+"."+(options.method || method) );
        env.i.do( target, query || model.toJSON(), opts, callback); 
        break;
      case 'read':
        var dataPath = options.dataPath || ( (model instanceof Backbone.Collection)? (model.dataPath || model.model.prototype.dataPath) : model.dataPath ) + ( options.method || ( (model instanceof Backbone.Collection ) ? ".find" : ".findOne" ) );
        env.i.do( dataPath , query || model.toJSON(), opts, callback); break;
    }
  };

  cb();

};
