module.exports = function(cb){

  var env    = this;
  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");
  
  if(!config.data || !fs.existsSync(path.join(config.rootDir, config.data.path))) return cb();

  var _      = require("underscore");
  var bulk   = require("bulk-require");

  var initializers = [];

  env.data = bulk(path.join(config.rootDir, config.data.path), ["**/*.js", "**/*.coffee"]);

  env.helpers.objectWalk(env.data, function(name, target, parent){
    if(_.isFunction(target)) {
      var DataLayer = setupDataLayer(name, target.apply(env));
      if(DataLayer){
        parent[name] = DataLayer;
      }
      else delete parent[name];
    }
    else target.do = env.do;
  });
  
  env.data.do = env.do;

  
  function setupDataLayer(name, DataLayer){
    if(!DataLayer.prototype.name) DataLayer.prototype.name = name;
    var instance = new DataLayer(env, DataLayer);
    if(instance.buildModel) {
      initializers.push(instance.buildModel);
      delete instance.buildModel;
    }
    return instance;
  }

  if(initializers.length){
    env.helpers.chain(initializers)(cb);
  }
  else{
    cb();
  }




  return;




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
    var Models = env.models = {do: env.do};
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

    if(env.relBuilders.length>0) _.invoke(env.relBuilders, "call");

    var exec = env._.chain(chain);
    exec(function(err){
      if(err) return cb(err);
      cb();
    });

  }


};
