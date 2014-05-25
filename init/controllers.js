

module.exports = function(cb){

  var _ = require("underscore");
  var baseMethods = _.methods(this.Controller.prototype);
  this.createController = function(name, ControllerClass){
    _.extend(ControllerClass.prototype, {
      methods: _.difference(_.methods(ControllerClass.prototype), baseMethods),
      name: name
    });

    if(ControllerClass.prototype.private) {
      _.extend(ControllerClass.prototype, ControllerClass.prototype.private);
      delete ControllerClass.prototype.private;
    }
    console.log("Set up controller: "+name);
    return new ControllerClass();
  };
  if(this.skipLoading === true) return cb&&cb();

  var env    = this;
  var path   = require("path");
  var fs     = require("fs");
  var config = env.config;

  if(!config.controllers || !fs.existsSync(path.join(config.rootDir, config.controllers))) return cb();
  
  var controllersPath = path.join(config.rootDir, config.controllers);
  
  if(fs.existsSync(path.join(config.rootDir, config.controllers, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.controllers, "init.js"));
    initializer.call(env, go);
  }
  else go();

  function go(err){
    if(err) return cb&&cb(err);
    env.controllers = env._.dirToObject(controllersPath, function(name, stuff, module){
      if(name === "init") return;
      var Prototype = module.apply(env);
      var name = Prototype.prototype.name||name;
      var controller = env.createController(name, Prototype);
      return controller;
    });
    // env._.debug(env.controllers, 2, "green", "env.controllers:");
    cb&&cb();
  }

}
