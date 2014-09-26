
var path = require("path");
var fs = require("fs");
var _ = require("underscore");


module.exports = function(cb){

  var CloneRPC = require("clone-rpc");

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
    var Models = env.Models = {};
    var modelsFiles = fs.readdirSync(modelsDir);

    var chain = [];

    modelsFiles.forEach(function(filename){
      if(filename === "init.js") return;
      var fn = require(path.join(modelsDir, filename));
      var ModelPrototype = fn.call(env);
      var name = ModelPrototype.collectionName||filename.split(".").slice(0, -1).join(".");
      Models[name] = ModelPrototype;
      chain.push(ModelPrototype.build);
    });

    var exec = env._.chain(chain);
    exec(function(err){
      if(err) return cb(err);
      console.log("Models built");
      // Build relations here
      
      cb();

    });

  }

  var factories = {};

  env.node.layer("model", function(data, cb, remote_addr){

  })

  function destroyFactory(remote_id, cb){
    delete factories[remote_id];
  }

  function setUpFactory(remote_addr, cb){

    var remote_id = remote_addr.slice(-1).pop();
    var ModelFactory = factories[remote_id] = new CloneRPC({
      getData:  function(fn  ){ getters[remote_id] = fn; },
      sendData: function(data){
        env.node.send(remote_addr.slice(), { type: "data", body: data });
      },
      onClone: function(){}
    });

    ModelFactory.build(remote_id, {}, function(){
      // Clone and build here all available models
      console.log("Model factory built !!!!!![][][][][][]");








    });






    return;
    // ///////////////////////////////////////////////////////////

    env.node.send(remote_addr, {
      type:       "data",
      initialize: true
    }, function(){
      ControllerFactory.build(env.address, {}, function(){
        for(var name in env.controllers){
          (function(name){
            var controller = env.controllers[name];
            ControllerFactory.clone(function(controller_clone){
              controller_clone.setOptions({context: controller});
              var controllerData = _.pick(controller, controller.methods);
              controllerData.availableMethods = controller.methods;
              controller_clone.build({
                name: name,
                methods: controller.methods
              }, controllerData, function(){
                
              });
            });
            
          })(name)
        }
      });
    });

  }



  

};

