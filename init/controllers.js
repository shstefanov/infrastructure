

module.exports = function(cb){
  var path = require("path");
  var fs = require("fs");
  var env = this;
  var config = env.config;
  if(!config.controllers || !fs.existsSync(path.join(config.rootDir, config.controllers))) return cb();
  
  var _ = require("underscore");
  var controllersPath = path.join(config.rootDir, config.controllers);
  var baseMethods = _.methods(env.Controller.prototype);
  
  if(fs.existsSync(path.join(config.rootDir, config.controllers, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.controllers, "init.js"));
    initializer.call(env, go);
  }
  else go();

  function go(err){
    if(err) return cb(err);
    env.controllers = env._.dirToObject(controllersPath, function(name, stuff, module){
      if(name === "init") return;
      var Prototype = module.apply(env);
      
      _.extend(Prototype.prototype, {
        methods: _.difference(_.methods(Prototype.prototype), baseMethods),
        name: name
      });
      
      if(Prototype.prototype.private) 
        _.extend(Prototype.prototype, Prototype.prototype.private);
      
      return new Prototype();
    });
    // env._.debug(env.controllers, 2, "green", "env.controllers:");
    cb();
  }

}
