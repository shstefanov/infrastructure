
var path = require("path");
var fs = require("fs");
var _ = require("underscore");


module.exports = function(cb){
  var env    = this;
  var config = env.config;
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models))) return cb();
  
  var modelsDir = path.join(config.rootDir, config.models);
  var Models    = env.Models = {};
  var modelsFiles = _.without(fs.readdirSync(modelsDir), ["init.js", "final.js"]);

  modelsFiles.forEach(function(filename){
    var fn = require(path.join(modelsDir, filename));
    var ModelPrototype = fn.call(env);
    var name = filename.split(".").slice(0, -1).join(".");
    Models[name] = createShallowModel(ModelPrototype);

  });

  function createShallowModel(ModelPrototype){
    console.log("Wrap all static methods to become proxies for remote real MongoModel");
    return ModelPrototype;
  }
  
  cb();
};

