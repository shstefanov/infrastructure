
var mixins = require("./lib/mixins");
module.exports = function(env, cb){
  
  var _          = require("underscore");
  var Addresator = require("addresator");
  var cluster    = require("cluster");

  env.createLayer = function(name, getter){

  }

  env.setUpFactory = function(addr, name, options, objHandler){ // TODO !!!
    // name will do send([], {type: name, body: ... })
    // objHandler will be onClone
    // options will be factory.build(options) for additional communication interface between nodes
    // default - {}
    // return new CloneRPC(...)
  };

 
  if(cluster.isMaster){

    var Pigeonry   = require("./tools/Pigeonry");

    var main = new Addresator({
      id: env.config.address,
      onMessage: function(data, cb, remote_addr){
        console.log("Server gets message: ", data);
        console.log("Remote_address: ", remote_addr);
        console.log("    ");
      },
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
              worker.send([addr_arr, data, cb_id]);
            });
            worker.on("message", function(data){
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
    env.config.workers.forEach(function(worker_config){
      if(!_.has(initializers, worker_config.type)) initializers[worker_config.type] = createSpawner(worker_config.type);
      initializers[worker_config.type](worker_config);
    });


    // Here comes in case of initialization error
    // TODO - think what to do - start again or something else ?!?!!?
    function handleError(err, worker, worker_config){
      console.log("Setup error: ", err, worker_config);
    }

  }


  else{

    env.getModels = function(cb){
      env.node.send([env.config.serverAddress], {type: "getDataNodes"}, function(err, dataNodes){
        if(err) return cb(err);
        if(env.config.type==="data"){ // Exclude me if i am of type data
          dataNodes = dataNodes.filter(function(address){
            return address!==env.config.address
          });
        }

        env.Models    = {};
        var factories = {};
        var getters   = {};
        env._.amap(dataNodes, function(nodeAddress, cb){
          // For each node we must create a Model factory
          env.node.send([env.config.serverAddress, nodeAddress], {type: "data", initialize: true}, function(err){
            if(err) return cb(err);
          });

          var ModelFactory = factories[remote_id] = new CloneRPC({
            getData:  function(fn  ){ getters[remote_id] = fn; },
            sendData: function(data){
              env.node.send(remote_addr.slice(), { type: "data", body: data });
            },
            onClone: function(){}
          });
        });

      });
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
      env.node.branch(env.config.serverAddress, function(addr_arr, data, cb_id){ process.send([addr_arr, data, cb_id]); });
      process.on("message", function(data){ env.node.route.apply(env.node, data); });
      env._.chain(chain)(function(err){ cb(err, env)  }, env);
    }

    function addresatorError(err, cb){
      console.log("Child addresator error("+env.config.type+" - "+env.config.type+"):", err);
    };

    var initializers = {

      http: [
        require("./initCluster/tools"        ),
        require("./initCluster/database"     ),
        require("./initCluster/socket"       ),
        require("./initCluster/http"         ),
        require("./initCluster/bundles"      ),
        require("./initCluster/pages"        )
      ],

      controller: [
        require("./initCluster/tools"        ),
        require("./initCluster/database"     ),
        require("./initCluster/controllers"  ),
      ],

      data: [
        require("./initCluster/tools"        ),
        require("./initCluster/database"     ),
        require("./initCluster/models"       ),
      ],

      council: [],
      custom:  [],

    }

  }

}; 
