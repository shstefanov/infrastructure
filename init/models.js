


module.exports = function(cb){

  var env    = this;
  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");
  
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models.path))) return cb();

  var _      = require("underscore");
  var bulk   = require("bulk-require");
  env.models = bulk(path.join(config.rootDir, config.models.path), ["**/*.js", "**/*.coffee"]);

  env.helpers.objectWalk(env.models, function(name, target, parent){
    if(_.isFunction(target)) {
      var model = setupModel(target.apply(env));
      if(model){
        parent[name] = model;
      }
      else delete parent[name];
    }
    else target.do = env.do;
  });
  
  env.models.do = env.do;





  function setupModel(Model){
    console.log("setupModel", Model);

    return Model;
  }




  return cb();




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
