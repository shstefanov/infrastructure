
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
              //console.log(">>>> core send to: ", worker_config.address, JSON.stringify(data));
              worker.send([addr_arr, data, cb_id]);
            });
            worker.on("message", function(data){
              //console.log(">>>> core get from: ", worker_config.address, JSON.stringify(data[1]));
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
    var dataLayers = [], sheduleDataRequests = [], dataModelsReady = false, dataLayersCount = 0;
    env.config.workers.forEach(function(worker_config){
      if(!_.has(initializers, worker_config.type)) initializers[worker_config.type] = createSpawner(worker_config.type);
      initializers[worker_config.type](worker_config);
      if(worker_config.type==="data") {
        dataLayersCount++;
        dataLayers.push(worker_config.address);
      }
    });

    main.layer("reportDataLayerReady", function(data, cb){
      dataLayersCount--;
      cb(null);
      if(dataLayersCount===0){
        dataModelsReady = true;
        sheduleDataRequests.forEach(function(f){f();});
        sheduleDataRequests = [];
      }
    });

    // Here comes in case of initialization error
    // TODO - think what to do - start again or something else ?!?!!?
    function handleError(err, worker, worker_config){
      console.log("Setup error: ", err, worker_config);
    }

    main.layer("modelMap", getModelMap);
    function getModelMap(data, cb, remote_addr){
      if(dataModelsReady===false) return sheduleDataRequests.push(function(){getModelMap(data, cb, remote_addr);})
      env._.amap(dataLayers, function(addr, cb){
        main.layers.modelMap.send([addr], data, function(err, models_arr){
          if(err) return cb(err);
          var result = {};
          if(models_arr.length>0) result[addr] = models_arr;
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
    }

  }

  else{
    // This code will be executed in child process

    function handleModel(model, countReady){
      model.build(model.id, {}, function(){
        env.Models[model.id] = model;
        countReady();
      });
    }

    var factories = {};
    function setUpFactory(node_addr, models, countReady){
      console.log("++++ setUpFactory for ", node_addr, JSON.stringify(models));
      var factory = factories[node_addr] = new CloneRPC({
        sendData: function(data)  { env.node.layers.data.send([env.config.serverAddress, node_addr], data); },
        getData:  function(){},
        onClone: function(clone){handleModel(clone, countReady);}
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
      console.log("++++", "getModels begin");
      env.node.layer("modelMap", function(){/* We will not handle anything for now*/});
      env.node.layer("data", handleModelMessage);
      if(!env.Models) env.Models = {};
      console.log("++++", "getModels layers.modelMap", [env.config.serverAddress]);
      env.node.layers.modelMap.send([env.config.serverAddress], env.config.loadModels, function(err, map){

        if(err) throw err;
        console.log("++++", "getModels map??", JSON.stringify(map));
        load(map, cb);
      });

      function load(obj, cb){
        //{node_id: [model, model2,...], ...}
        var counter = 0;
        for(var key in obj){
          if(key===env.config.address) continue; // Do not load myself
          var models = obj[key];
          if(models.length>0) {
            counter+=models.length;
            setUpFactory(key, models, function(){
              counter--;
              if(counter===0) cb();
            });
          }
        }
      }
    }
    function addresatorError(err, cb){
      console.log("Child addresator error("+env.config.type+" - "+env.config.type+"):", err);
    };      

    if(env.config.loadModels) env.getModels(go);
    else go();

    function go(){
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
          //console.log(">>>> node "+env.config.address+" sends to "+ env.config.serverAddress+ ": "+JSON.stringify(data));
          process.send([addr_arr, data, cb_id]); 
        });
        process.on("message", function(data){ 
          //console.log(">>>> node "+env.config.address+" gets from to "+ env.config.serverAddress+ ": "+JSON.stringify(data[1]));
          env.node.route.apply(env.node, data); 
        });

        if(env.config.loadModels) env.getModels(function(){
          env._.chain(chain)(function(err){ cb(err, env)  }, env);
        });
        else env._.chain(chain)(function(err){ cb(err, env)  }, env);

      }

    }
    

    var proxy = function(place){
      return function(cb){
        console.log("Chain:: ", env.config.type, env.config.address, place);
        cb();
      }
    }

    var initializers = {

      http: [
        require("./initCluster/tools"        ),//        proxy("tools"),
        require("./initCluster/database"     ),//        proxy("database"),
        require("./initCluster/socket"       ),//        proxy("socket"),
        require("./initCluster/http"         ),//        proxy("http"),
        require("./initCluster/bundles"      ),//        proxy("bundles"),
        require("./initCluster/pages"        ),//        proxy("pages"),
      ],

      controller: [
        require("./initCluster/tools"        ),        proxy("???? tools"),
        require("./initCluster/database"     ),        proxy("???? database"),
        require("./initCluster/controllers"  ),        proxy("???? controllers"),
        function(cb){
          console.log("@@@@ ", JSON.stringify(Object.keys(env.Models)));
            env.Models.User.find({}, {password:false}, function(err, users){
              console.log("@@@@ OOOOOYYYEEEEEE!!!!!", JSON.stringify(users));
            })
          cb();
        }
      ],

      data: [
        require("./initCluster/tools"        ),//        proxy("tools"),
        require("./initCluster/database"     ),//        proxy("database"),
        require("./initCluster/models"       ),//        proxy("models"),
        function(cb){
          env.node.layer("reportDataLayerReady", function(){});
          env.node.layers.reportDataLayerReady.send([env.config.serverAddress], true, function(err){
            cb();
          }); 
        }
      ],

      council: [],
      custom:  [],

    }

  }

}; 
