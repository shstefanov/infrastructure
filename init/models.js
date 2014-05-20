
var path = require("path");
var fs = require("fs");
var _ = require("underscore");

var ModelFactory = require("../lib/ModelFactory");

module.exports = function(cb){
  var env = this;
  var config = env.config;
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models))) return cb();
  
  var modelsDir = path.join(config.rootDir, config.models);
  
  if(fs.existsSync(path.join(config.rootDir, config.models, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.models, "init.js"));
    initializer.call(env, go);
  }
  else go();
  //////////////////////////////////////
  // this._.debug(null, 1, "red", "MODELS");
  //////////////////////////////////////
  function go(err){
    env.Models = {};
    if(err) return cb(err);
    fs.readdirSync(modelsDir).filter(function(filename){
      return filename !== "init.js";
    }).forEach(function(filename){
      var ModelBuilder = require(path.join(modelsDir, filename));
      var Model = Model.apply(env);
      var modelName = filename.replace(/(\.js|\.coffee)$/, "");
      env.Models[modelName] = Model;
    });
    cb();
  }
  

};