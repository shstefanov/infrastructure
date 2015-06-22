module.exports = function(cb){

  var env = this;

  var Backbone  = require("backbone");
  Backbone.sync = function(method, model, options){
    
    function callback(err, result){
      err? options.error(err) : options.success(result);
    }

    var query  = options.query;
    var opts   = options.options;
    var fields = options.fields;

    options || (options = {});
    switch (method) {
      case 'create':
        env.i.do(model.dataPath+".create", model.toJSON(), opts, callback);  break;
      case 'update':
        env.i.do(model.dataPath+".update", query || model.toJSON(), opts, callback); break;
      case 'delete':
        env.i.do(model.dataPath+".delete", query || model.toJSON(), opts, callback); break;
      case 'read':
        var dataPath = ( model.models? (model.dataPath || model.model.prototype.dataPath) : model.dataPath );
        var path = (model.models?".find":".findOne");
        env.i.do( dataPath+path , query, opts, callback); break;
    }
  };


  cb();

};
