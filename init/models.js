


module.exports = function(cb){

  var env    = this;
  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");
  
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models.path))) return cb();

  var _      = require("underscore");

  env.getCached = function(target){
    if(!target.__cached) { target.__cached = target.apply(env); }
    return target.__cached;
  }
  
  var bulk   = require("bulk-require");
  env.models = bulk(path.join(config.rootDir, config.models.path), ["**/*.js", "**/*.coffee"]);

  env.helpers.objectWalk(env.models, function(name, target, parent){

    if(_.isFunction(target)) {
      var model
      
      if(!target.__cached) target.__cached = target.apply(env);
      model = target.__cached;
      
      if(model){ parent[name] = model; }
      else {delete parent[name];}

    }
    else target.do = env.do;
  });
  
  env.models.do = env.do;

  var Backbone = require("backbone");
  Backbone.sync = function(method, model, options){
    console.log("SYNC:::")
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
    function callback(err, result){err? options.error(err) : options.success(result);}
  };

  cb()

};
