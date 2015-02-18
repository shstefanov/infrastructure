

module.exports = function(cb){

  var _ = require("underscore");
  var base = _.methods(this.Controller.prototype);
  this.createController = function(name, Controller){
    
    var pr = Controller.prototype;
    _.extend(pr, {name: name, methods: _.difference(_.methods(pr), base)});
    pr.private?_.extend(pr, pr.private):null;
    delete pr.private;

    return new Controller();
    env.sys("controller", "Built: "+line.slice(name.length)+name);
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
    env.controllers = env._.dirToObject(controllersPath, function(name, folderName, module){
      if(name === "init" || name === "final" || folderName !== undefined || name.indexOf("_")===0) return;
      var Prototype = module.apply(env);
      var name = Prototype.prototype.name||name;
      var controller = env.createController(name, Prototype);
      return controller;
    });
    if(fs.existsSync(path.join(config.rootDir, config.controllers, "final.js"))){
      var finalizer = require(path.join(config.rootDir, config.controllers, "final.js"));
      finalizer.call(env, cb);
    }else{
      cb();
    }
  }

}
