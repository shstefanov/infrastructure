
var path = require("path");
var fs = require("fs");
var _ = require("underscore");


module.exports = function(cb){
  
  var env = this;
  var config = env.config;
  
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models))) return cb();
  
  var modelsDir = path.join(config.rootDir, config.models);
  require("../tools/MongoModel")(env);
  if(fs.existsSync(path.join(config.rootDir, config.models, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.models, "init.js"));
    initializer.call(env, go);
  }

  else go();

  function go(err){

    if(err) return cb(err);
    var modelsDir = path.join(config.rootDir, config.models);
    var Models = env.models = {};
    var modelsFiles = fs.readdirSync(modelsDir);

    var chain = [];
    modelsFiles.forEach(function(filename){
      if(filename === "init.js") return;
      var fn = require(path.join(modelsDir, filename));
      var ModelPrototype = fn.call(env);
      var name = ModelPrototype.collectionName||filename.split(".").slice(0, -1).join(".");
      Models[name] = ModelPrototype;
      chain.push(ModelPrototype.buildModel);
    });

    var exec = env._.chain(chain);
    exec(function(err){
      if(err) return cb(err);
      cb();
    });

  }
  

};

