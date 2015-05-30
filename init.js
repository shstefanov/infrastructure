var _       = require("underscore");
var cluster = require("cluster");

module.exports = function(env, cb){

  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");

  var _      = require("underscore");
  var bulk   = require("bulk-require");

  env.structureLoader = function(name, setup, cb){


    var structureConfig = env.config[name];
    if(!structureConfig) return cb(new Error("Cant find config: env.config."+name + " structure "+name));
    var stagePath = path.join(env.config.rootDir, structureConfig.path);
    if(!fs.existsSync(stagePath)) return cb(new Error("Cant find path: "+ stagePath + " structure "+name));

    var initializers = [];
    env[name] = bulk(stagePath, ["**/*.js", "**/*.coffee"]);
    env[name].do = env.do;

    env.helpers.objectWalk(env[name], function(nodeName, target, parent){
      if(nodeName === "do") return;
      if(_.isFunction(target)) {
        var Node = setup(nodeName, target.apply(env));
        if(Node){
          parent[nodeName] = Node;
          if(Node.setupNode) initializers.push(Node.setupNode);
        }
        else delete parent[nodeName];
      }
      else target.do = env.do;
    });

    if(initializers.length) env.helpers.chain(initializers)(cb, env);
    else                    cb();
    

  }


  if      (!env.config.nodes && cluster.isMaster)     require("./init/single.js")(env, cb);
  else if (env.config.nodes  && cluster.isMaster)     require("./init/master.js")(env, cb);
  else                                                require("./init/worker.js")(env, cb);
















  return;
  if(env.config.nodes && cluster.isMaster){
    var initWorker = require("./init/initWorker");
    var nodes = env.config.nodes;
    function createNode(nc, index){
      nc.type = key, nc.id = (typeof nc.id == "undefined")? index : nc.id;
      initWorker(env, key, nc, function(err, node){
        if(err) return console.log("Error:", err);
        node.config = nc;
      });
    }
    for(var key in nodes){
      var nodeConfig = nodes[key];
      if(_.isArray(nodeConfig)) nodeConfig.forEach(createNode);
      else                      createNode(nodeConfig);
    }
    return cb(null, env);
  }

  else{

      var initializers = {

        // Model worker dependencies
        models:          function(){
          _.extend(env, {
            ExtendedModel:               require("./lib/ExtendedModel"),
            ExtendedCollection:         require("./lib/ExtendedCollection")
          });
          require("./lib/MongoModel")(env);

          var chain = [
              require("./init/mongodb"),
              require("./init/models"),
          ];
          if(config.mysql) {
            require("./lib/MySQLModel")(env);
            chain.unshift(require("./init/mysql"));
          }

          return chain;
        },


        http:           function(){
          _.extend(env, {
            Page:             require("./lib/Page"),
            Api:              require("./lib/Api"),
            Widget:           require("./lib/Widget"),
          });

          return [
                              require("./init/mongodb"),
                              require("./init/http"),
                              require("./init/pages"),
          ];
        },

        controllers:     function(){
          _.extend(env, {
            ExtendedModel:               require("./lib/ExtendedModel"),
            ExtendedCollection:         require("./lib/ExtendedCollection"),
            Controller:                  require("./lib/Controller"),
          });

          return [
                              require("./init/controllers"),
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
      //var chain  = env.chain;

      var cbCounter = 0;
      var callbacks = {};

      function createCallback(cb){
        cbCounter++;
        var id = [config.type, config.id, cbCounter].join(".");
        callbacks[id] = cb;
        return id;
      }

      env.send = function(data){
        process.send(data);
      };
      var sl = Array.prototype.slice, pop = Array.prototype.pop;
      env.call = function(address, data, cb){
        // make the data to be array of arguments


        env.send({
          type:     "call",
          address:  address,
          data:     sl.call(arguments, 1, -1),
          cb:       createCallback(pop.call(arguments))
        });
        
      };

      env.fire = function(event, data){
        // Send this to main process
      };

      env.callback = function(data){ process.send(data); };

      env.dropCallback = function(cb){
        console.log("TODO: drop callback");
      };

      var access;

      // Incoming messages
      var msgTypes = {
        call: function(data){
          var parts  = data.address.split(".");
          var name   = parts[2];
          var method = parts[3];
          var object = access[name];
          
          if(!object) return env.callback({
            type: "cb",
            cb:   data.cb,
            error:"Can't find target: "+name
          });

          var callback = function(err, result){
            if(err) return env.callback({
              type:     "cb",
              cb:       data.cb,
              error:    err
            });

            else env.callback({
              type:     "cb",
              cb:       data.cb,
              error:    err,
              result:   result
            });
          }

          var args = data.data.concat([callback]);

          if(object.methods){
            if(object.methods.indexOf(method) != -1 && _.isFunction(object[method])){
              object[method].apply(object, args);
            }
            else{
              return callback("Can't find method "+method);
            }
          }
          else if(_.isFunction(object[method])){
            object[method].apply(object, args);
          }
          else{
            return callback("Unspecified call error");
          }
        },

        cb: function(data){
          var callback = callbacks[data.cb];
          if(callback) {
            delete callbacks[data.cb];
            callback(data.error, data.result);
          }
        }
      };

      var handleMessage = function(msg){
        if(msgTypes[msg.type]) msgTypes[msg.type](msg);
      };

      var msgCache = [];
      var cacheMessages = function(msg){ msgCache.push(msg); };
      env.handleMessage = cacheMessages;
      process.send("message");
      process.once("message", function(nodeConfig){

        _.extend(config, nodeConfig);
        var initializer = initializers[config.type];
        var chain;

        if(initializer) chain = initializer();
        else chain = customInitializer();

        process.on("message", function(msg){ env.handleMessage(msg); });
        env._.chain(chain)(function(err){
          if(err) {
            env.send({
              type: "error",
              message: err,
              worker: [config.type, config.id]
            });
          }
          access = env[config.type];
          env.handleMessage = handleMessage;
          msgCache.forEach(handleMessage);
          msgCache = [];
          cb(null, env);
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

  // function go(){
  //   var proxy = function(cb){
  //     env._.debug("", 2, "green", "PROXY IN INIT");
  //     cb(null);
  //   };

  //   env._.chain([
  //     require("./init/tools"        ),
  //     require("./init/database"     ),
  //     function(env, cb){
  //       console.log("here", this);

  //     },
  //     require("./init/models"       ),
  //     require("./init/socket"       ),
  //     require("./init/http"         ),
  //     require("./init/bundles"      ),
  //     require("./init/controllers"  ),
  //     require("./init/pages"        )
  //   ])(function(err){ cb(err, env)  }, env);

  // }


};
