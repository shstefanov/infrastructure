var cluster = require("cluster");
var mixins  = require("./lib/mixins");
var _       = require("underscore");

module.exports = function(env, cb){
  mixins.apply(env);

  if(env.config.nodes && cluster.isMaster){
    var initWorker = require("./initWorker");
    var nodes = env.config.nodes;
    for(var key in nodes){
      function createNode(nc, index){
        nc.type = key, nc.id = (typeof nc.id == "undefined")? index : nc.id;
        initWorker(env, key, nc, function(err, node){
          if(err) return console.log("Error:", err);
          node.config = nc;
        });        
      }
      var nodeConfig = nodes[key];
      if(_.isArray(nodeConfig)) nodeConfig.forEach(createNode);
      else                      createNode(nodeConfig);

    }

    return cb();
  }

  else{



      var initializers = {

        http:           function(){
          _.extend(env, {
            Page:               require("./tools/Page"),
            Api:                require("./tools/Api"),
            Widget:             require("./tools/Widget"),
          });
          return [
                                require("./init/database"),
                                require("./init/http"),
                                require("./init/pages"),
          ];
        },
        controller:     function(){
          _.extend(env, {
            Controller:               require("./tools/ClusterController"),
          });
          return [
                                      require("./init/controllers"),
          ];
        },


        // Model worker dependencies
        model:          function(){
          _.extend(env, {
            AdvancedModel:               require("./tools/AdvancedModel"),
            AdvancedCollection:          require("./tools/AdvancedCollection"),
          });
          require("./tools/MongoModel")(env);
          // _.extend(env, {
          //   Page:               require("./tools/Page"),
          //   Page:               require("./tools/Page"),
          //   Api:                require("./tools/Api"),
          //   Widget:             require("./tools/Widget"),
          // });
          return [
              require("./init/database"),
              require("./init/models"),
          ];
        },
        front:          function(){
          return [
            
          ];
        },
        system:         function(){
          return [
            
          ];
        },
        controlPanel:   function(){
          return [
            
          ];
        },
        remote:         function(){
          return [
            
          ];
        },

      };



      var config = env.config;
      var chain  = env.chain;

      env.call = function(address, data, cb){
        // address - string with dot notation
        // data - custom object, string, number, boolean or array

        console.log(address+" proceeding ........");
        setTimeout(function(){
          console.log(address+" [ready]");
          cb(null, JSON.parse("{\""+address+"\":"+Date.now()+"}"));
        }, 4000);
      };

      env.fire = function(event, data){
        // Send this to main process
      };

      env.dropCallback = function(cb){
        console.log("TODO: drop callback");
      };



      process.send("message");
      process.once("message", function(nodeConfig){
        _.extend(config, nodeConfig);
        var initializer = initializers[config.type];
        var chain;
        if(initializer){
          chain = initializer();
          //console.log("initializer found: ", config.type);
        }
        else{
          chain = customInitializer();
        }


        env._.chain(chain)(function(err){
          if(err) {
            throw err;
            return console.log("error: ", err);
          }

          //console.log("initializer ready", config.type);
        }, env);

      });



      function customInitializer(){
        return [

        ];
      }

  }




  // if(env.config.clusterMode===true){
  //   var initCluster = require("./initCluster");
  //   return initCluster(env, cb);
  // }

  function go(){
    var proxy = function(cb){
      env._.debug("", 2, "green", "PROXY IN INIT");
      cb(null);
    };
    
    env._.chain([
      require("./init/tools"        ),
      require("./init/database"     ),
      function(env, cb){
        console.log("here", this);

      },
      require("./init/models"       ),
      require("./init/socket"       ),
      require("./init/http"         ),
      require("./init/bundles"      ),
      require("./init/controllers"  ),
      require("./init/pages"        )
    ])(function(err){ cb(err, env)  }, env);
    
  }
  

}; 
