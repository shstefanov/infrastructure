

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
  var config = env.config;
  if(!config.controllers) return cb();
  var path   = require("path");
  var fs     = require("fs");

  if(!config.controllers.path || !fs.existsSync(path.join(config.rootDir, config.controllers.path))) return cb();
  
  var controllersPath = path.join(config.rootDir, config.controllers.path);
  var initPath        = path.join(controllersPath, "init.js");
  var finalPath       = path.join(controllersPath, "final.js");
  if(fs.existsSync(initPath) ){
    var initializer = require(initPath);
    initializer.call(env, go);
  }
  else go();

  function go(err){
    if(err) return cb&&cb(err);
    var bulk        = require("bulk-require");
    env.controllers = {call: env.callTarget};
    _.each(bulk(controllersPath, "*.js"), function(module, name){
      var Proto = module.call(env);
      // var controllerName = name.charAt(0).toLowerCase() + name.slice(1);
      Proto.prototype.name = name;
      env.controllers[name] = new Proto(env);
    });
    // console.log("controllers: ", env.controllers);


    // env.controllers = env._.dirToObject(controllersPath, function(name, folderName, module){
    //   if(name === "init") return;
    //   var Prototype = module.apply(env);
    //   var name = Prototype.prototype.name||name;
    //   return env.createController(name, Prototype);
    // });

    // if( fs.existsSync(finalPath) ){
    //   var finalizer = require(finalPath);
    //   finalizer.call(env, cb);
    // }
    // else{
    //   cb();
    // }
  }

}
