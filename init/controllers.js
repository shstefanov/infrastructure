

module.exports = function(cb){

  var _      = require("underscore");
  var base   = _.methods(this.Controller.prototype);
  this.createController = function(name, Controller){
    var pr = Controller.prototype;
    _.extend(pr, {env:env, name: name, methods: _.difference(_.methods(pr), base)});
    pr.private?_.extend(pr, pr.private):null;
    delete pr.private;
    return new Controller();
  };

  var env    = this;
  var path   = require("path");
  var fs     = require("fs");
  var config = env.config;

  if(!config.controllers || !fs.existsSync(path.join(config.rootDir, config.controllers))) return cb();
  
  var controllersPath = path.join(config.rootDir, config.controllers);
  var initPath        = path.join(controllersPath, "init.js");
  var finalPath       = path.join(controllersPath, "final.js");
  if(fs.existsSync(initPath) ){
    var initializer = require(initPath);
    initializer.call(env, go);
  }
  else go();

  function go(err){
    if(err) return cb&&cb(err);
    env.controllers = env._.dirToObject(controllersPath, function(name, folderName, module){
      if(name === "init") return;
      var Prototype = module.apply(env);
      var name = Prototype.prototype.name||name;
      return env.createController(name, Prototype);
    });

    if( fs.existsSync(finalPath) ){
      var finalizer = require(finalPath);
      finalizer.call(env, cb);
    }
    else{
      cb();
    }
  }

}
