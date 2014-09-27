
var mixins = require("./lib/mixins");
module.exports = function(env, cb){
  
  var _          = require("underscore");
  var Addresator = require("addresator");
  var CloneRPC   = require("clone-rpc");
  var cluster    = require("cluster");
 
  if(cluster.isMaster){

    var Pigeonry   = require("./tools/Pigeonry");

    var main = new Addresator({
      id: env.config.address,
      layers: true,
      // onMessage: function(data, cb, remote_addr){
      //   console.log("Server gets message: ", data);
      //   console.log("Remote_address: ", remote_addr);
      //   console.log("    ");
      // },
      onError:   function(err, cb){
        console.log("Server addresator error:", err);
      }
    });

    Pigeonry.call(env, main);

    function createSpawner(name){
      return function(worker_config){
        worker_config.serverAddress = env.config.address;
        var worker = cluster.fork();
        worker.once("message", function(){
          worker.send(worker_config);
          worker.once("message", function(err){
            if(err) return handleError(err, worker, worker_config);
            main.branch(worker_config.address, function(addr_arr, data, cb_id){
              console.log(">>>> core send to: ", worker_config.address, JSON.stringify(data));
              worker.send([addr_arr, data, cb_id]);
            });
            worker.on("message", function(data){
              console.log(">>>> core get from: ", worker_config.address, JSON.stringify(data[1]));
              main.route.apply(main, data);
            });
          });
          worker.on("exit", function(){
            main.send(["pigeonry"], {destroy:true, address: worker_config.address});
            main.dropBranch(worker_config.address);
            initializers[name](worker_config);
          });
        });
      };
    }

    var initializers = {};
    var dataLayers = [], sheduleDataRequests = [], dataModelsReady = false;
    env.config.workers.forEach(function(worker_config){
      if(!_.has(initializers, worker_config.type)) initializers[worker_config.type] = createSpawner(worker_config.type);
      initializers[worker_config.type](worker_config);
      if(worker_config.type===data) dataLayers.push(worker_config.address);
    });


    // Here comes in case of initialization error
    // TODO - think what to do - start again or something else ?!?!!?
    function handleError(err, worker, worker_config){
      console.log("Setup error: ", err, worker_config);
    }

    main.layer("modelMap", function(data, cb, remote_addr){
      env._.amap(dataLayers, function(addr, cb){
        main.layers.modelMap.send([addr], data, function(err, models_arr){
          if(err) return cb(err);
          var result = {};
          if(models_arr.length>0) result[addr] = models;
          cb(null, result);
        });
        
      }, function(err, results){
        //[{node_addr:[model, model2,...]}, ...]
        if(err) return cb(err);
        var result = {};
        results.forEach(function(r){
          for(var key in r){
            result[key] = r[key];
          }
        });
        cb(null, result);
      })
    });

  }

  else{


    function handleModel(model){
      model.build(model.id, {}, function(){
        env.Models[model.id] = model;
      });
    }

    var factories = {};
    function setUpFactory(node_addr, models){
      var factory = factories[node_addr] = new CloneRPC({
        sendData: function(data)  { env.node.layers.data.send([env.config.serverAddress, node_addr], data); },
        getData:  function(){},
        onClone: handleModel
      });

      env.node.layers.data.send([env.config.serverAddress, node_addr], {initialize:true, models: models}, function(err){
        factory.build(env.config.address, {}, function(){

        });
      });
    }

    function handleModelMessage(data, cb, remote_addr){
      var layer = this;
      var remote_id = remote_addr.slice(-1).pop();
      var factory = factories[remote_id];
      if(!factory) return cb && cb("Can't find factory: " + remote_id);
      factory.onMessage(data);
    }

    env.getModels = function(cb){
      env.node.layer("modelMap", function(){/* We will not handle anything for now*/});
      env.node.layer("data", handleModelMessage);
      if(!env.Models) env.Models = {};
      env.node.layer.modelMap.send([env.config.serverAddress], env.config.loadModels, function(err, map){
        if(err) throw err;
        load(map);
      });

      function load(obj){
        //{node_id: [model, model2,...], ...}
        for(var key in obj){
          if(key===env.config.address) continue; // Do not load myself
          var models = obj[key];
          if(models.length>0) setUpFactory(key, models);
        }
      }
    }
    
    process.send("message");
    process.once("message", function(config){
      if(!_.has(initializers, config.type)) return process.send("Cant initialize worker type: "+config.type);
      _.extend(env.config, config);
      process.send(null);
      initialize(initializers[config.type]);
    });

    function initialize(chain){
      env.node = new Addresator({
        layers:    true,
        id:        env.config.address,
        onError:   addresatorError
      });
      env.node.branch(env.config.serverAddress, function(addr_arr, data, cb_id){
        console.log(">>>> node "+env.config.address+" sends to "+ env.config.serverAddress+ ": "+JSON.stringify(data));
        process.send([addr_arr, data, cb_id]); 
      });
      process.on("message", function(data){ 
        console.log(">>>> node "+env.config.address+" gets from to "+ env.config.serverAddress+ ": "+JSON.stringify(data[1]));
        env.node.route.apply(env.node, data); 
      });
      env._.chain(chain)(function(err){ cb(err, env)  }, env);
    }

    function addresatorError(err, cb){
      console.log("Child addresator error("+env.config.type+" - "+env.config.type+"):", err);
    };

    var proxy = function(place){
      return function(cb){
        console.log("Chain:: ", env.config.type, env.config.address, place);
        cb();
      }
    }

    var initializers = {

      http: [
        require("./initCluster/tools"        ),        proxy("tools"),
        require("./initCluster/database"     ),        proxy("database"),
        require("./initCluster/socket"       ),        proxy("socket"),
        require("./initCluster/http"         ),        proxy("http"),
        require("./initCluster/bundles"      ),        proxy("bundles"),
        require("./initCluster/pages"        ),        proxy("pages"),
      ],

      controller: [
        require("./initCluster/tools"        ),        proxy("tools"),
        require("./initCluster/database"     ),        proxy("database"),
        require("./initCluster/controllers"  ),        proxy("controllers"),
      ],

      data: [
        require("./initCluster/tools"        ),        proxy("tools"),
        require("./initCluster/database"     ),        proxy("database"),
        require("./initCluster/models"       ),        proxy("models"),
      ],

      council: [],
      custom:  [],

    }

  }

}; 
