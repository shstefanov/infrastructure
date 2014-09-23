
var mixins = require("./lib/mixins");
module.exports = function(env, cb){
  
  var _          = require("underscore");
  var Addresator = require("addresator");
  var cluster    = require("cluster");
  
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
        

    var initializers = {

      http: function(worker_config){
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
            initializers.http(worker_config);
          });
        });
      },


      controller: function(worker_config){
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
            main.dropBranch(worker_config.address);
            initializers.http(worker_config);
          });
        });
      }

    }

    env.config.workers.forEach(function(worker_config){
      if(_.has(initializers, worker_config.type)){
        initializers[worker_config.type](worker_config)
      }
    });


    // Here comes in case of initialization error
    // TODO - think what to do - start again or something else ?!?!!?
    function handleError(err, worker, worker_config){
      console.log("Setup error: ", err, worker_config);
    }

  }














  else{
    
    process.send("message");
    process.once("message", function(config){
      if(!_.has(initializers, config.type)) return process.send("Cant initialize worker type: "+config.type);
      _.extend(env.config, config);
      process.send(null);
      initializers[config.type]();
    });




    var initializers = {
      


      http: function(){
        env.node = new Addresator({
          id: env.config.address,
          onMessage: function(data, cb, remote_addr){},
          onError:   function(err, cb){
            console.log("Child addresator error:", err);
          }
        });

        env.node.branch(env.config.serverAddress, function(addr_arr, data, cb_id){
          process.send([addr_arr, data, cb_id]);
        });
        process.on("message", function(data){
          env.node.route.apply(env.node, data);
        });

        env._.chain([
          require("./initCluster/tools"        ),
          require("./initCluster/database"     ),
          // require("./initCluster/models"       ),
          require("./initCluster/socket"       ),
          require("./initCluster/http"         ),
          require("./initCluster/bundles"      ),
          // require("./initCluster/controllers"  ),
          require("./initCluster/pages"        )
        ])(function(err){ cb(err, env)  }, env);
      },

      controller: function(){
        env.node = new Addresator({
          id: env.config.address,
          onMessage: function(data, cb, remote_addr){},
          onError:   function(err, cb){
            console.log("Child addresator error:", err);
          }
        });

        env.node.branch(env.config.serverAddress, function(addr_arr, data, cb_id){
          process.send([addr_arr, data, cb_id]);
        });
        process.on("message", function(data){
          env.node.route.apply(env.node, data);
        });

        env._.chain([
          require("./initCluster/tools"        ),
          require("./initCluster/database"     ),
          // require("./initCluster/models"       ),
          //require("./initCluster/socket"       ),
          //require("./initCluster/http"         ),
          //require("./initCluster/bundles"      ),
          require("./initCluster/controllers"  ),
          //require("./initCluster/pages"        )
        ])(function(err){ cb(err, env)  }, env);
      }

    }

  }
  
  // var proxy = function(cb){
  //   env._.debug("", 2, "green", "PROXY IN INIT");
  //   cb(null);
  // };
  
  // env._.chain([
  //   require("./init/tools"        ),
  //   require("./init/database"     ),
  //   require("./init/models"       ),
  //   require("./init/socket"       ),
  //   require("./init/http"         ),
  //   require("./init/bundles"      ),
  //   require("./init/controllers"  ),
  //   require("./init/pages"        )
  // ])(function(err){ cb(err, env)  }, env);

}; 
