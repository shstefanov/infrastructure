
var path = require("path");
var fs = require("fs");
var _ = require("underscore");


module.exports = function(cb){

  var CloneRPC = require("clone-rpc");

  var env = this;
  var config = env.config;
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models))) return cb();
  
  var modelsDir = path.join(config.rootDir, config.models);
  require("../tools/MongoClusterModel")(env);
  if(fs.existsSync(path.join(config.rootDir, config.models, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.models, "init.js"));
    initializer.call(env, go);
  }

  else go();

  function go(err){
    if(err) return cb(err);
    var modelsDir = path.join(config.rootDir, config.models);
    var Models = env.Models = {};
    env.realModels = {};
    var modelsFiles = fs.readdirSync(modelsDir);

    var chain = [];

    modelsFiles.forEach(function(filename){
      if(filename === "init.js") return;
      var fn = require(path.join(modelsDir, filename));
      var ModelPrototype = fn.call(env);
      var name = ModelPrototype.collectionName||filename.split(".").slice(0, -1).join(".");
      Models[name] = ModelPrototype;
      env.realModels[name] = ModelPrototype;
      chain.push(ModelPrototype.buildModel);
    });

    var exec = env._.chain(chain);
    exec(function(err){
      if(err) return cb(err);
      modelsReady = true;
      shedule.forEach(function(s){s();});
      cb();
    });

  }

  var modelsReady = false;
  var shedule     = [];
  var factories   = {};

  env.node.layer("modelMap", modelsRequest);

  function modelsRequest(data, cb, remote_addr){
    var layer = this;
    if(modelsReady===false) return shedule.push(function(){ modelsRequest.call(layer, data, cb, remote_addr); });
    cb(null, (data==="all")? Object.keys(env.realModels) : data.filter(function(modelName){
      return !!env.realModels[modelName];
    }));
  }

  env.node.layer("data", handleDataMessage);
  function handleDataMessage(data, cb, remote_addr){
    var layer = this;
    if(modelsReady===false) return shedule.push(function(){ handleDataMessage.call(layer, data, cb, remote_addr); });
    if(data.initialize===true) createModelFactory(remote_addr, data.models, layer, cb);
    else if(data.destroy===true) destroyModelFactory(data.address);
    else{
      var remote_id = remote_addr.slice(-1).pop();
      var factory = factories[remote_id];
      if(!factory) return cb && cb("Can't find factory: " + remote_id);
      factory.onMessage(data);
    }
  }

  function destroyModelFactory(address){
    throw new Error("TODO - implement destroy model factory");
  }

  function createModelFactory(remote_addr, models, layer, cb){
    if(!models) models = Object.keys(env.Models);
    else{
      models = models.filter(function(modelName){
        return !!env.Models[modelName];
      });
      if(models.length===0) return cb("Can't find models: "+models.join(", "));
    }
    var remote_id = remote_addr.slice(-1).pop();
    var factory = factories[remote_id] = new CloneRPC({
      sendData: function(data)  { layer.send(remote_addr.slice(), data); },
      getData:  function(){},
      onClone: function(){}
    });
    
    factory.build(env.config.address, {}, function(){
      cloneModels(factory, models);
    });

    function cloneModels(factory, models){
      models.forEach(function(modelName){
        var Model = env.Models[modelName];
        factory.clone(function(clone){
          clone.setOptions({context:Model});
          var methods = _.methods(Model);
          clone.build(modelName, _.extend({availableMethods:methods},_.pick(Model, methods)), function(){
          });
        });
      });
    }




    cb(null);
  }

  

};

