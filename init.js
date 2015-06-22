var _       = require("underscore");
var cluster = require("cluster");

module.exports = function(env, cb){

  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");

  var _      = require("underscore");
  var bulk   = require("bulk-require");

  env.getCached = function(target){
    if(!target.__cached) { target.__cached = target.apply(env); }
    return target.__cached;
  };

  env.structureLoader = function(name, setup, cb, cached){

    var structureConfig = env.config.structures[name];
    if(!structureConfig) return cb(new Error("Cant find config: env.config.structures."+name + " structure "+name));
    var stagePath = path.join(env.config.rootDir, structureConfig.path);
    if(!fs.existsSync(stagePath)) return cb(new Error("Cant find path: "+ stagePath + " structure "+name));

    var initializers = [], structureInit;
    env.i[name] = bulk(stagePath, ["**/*.js", "**/*.coffee"]);
    env.i[name].do = env.i.do;

    if(env.i[name].index) {
      structureInit = env.i[name].index;
      delete env.i[name].index;
    }

    if(structureInit) structureInit.call(env, function(err, postinit){
      if(err) return cb(err);
      if(postinit) go(function(err){
        if(err) return cb(err);
        postinit(cb);
      });
      else go(cb);
    });
    else go(cb);

    function go(cb){
      env.helpers.objectWalk(env.i[name], function(nodeName, target, parent){
        if(nodeName === "do") return;
        if(_.isFunction(target)) {
          var Node;
          if(setup)        Node = setup(nodeName, env.getCached(target));
          else if (cached) Node = env.getCached(target);
          else             Node = target;

          if(Node){
            parent[nodeName] = Node;
            if(Node.setupNode) initializers.push(Node.setupNode);
          }
          else delete parent[nodeName];
        }
        else target.do = env.i.do;
      });
      if(initializers.length) env.helpers.chain(initializers)(cb, env);
      else                                                    cb(); 
    }

  }

  env.engines = {};
  env.i       = {};
  env.classes = {};

  if(config.app.process_mode === "cluster"){

    var callbacks = {}, cb_index = 0;
    env.serializeCallback = function serializeCallback(fn){
      cb_index++;
      callbacks[cb_index] = fn;
      return cb_index;
    }

    env.runCallback = function runCallback(data){
      var fn = callbacks[data.run_cb[1]];
      if(fn) {
        fn.apply(global, data.args);
        delete callbacks[data.run_cb[1]];
      }
    }


    var cluster = require("cluster");
    if(cluster.isMaster){
      require("./init/process/master.js")(env, cb);
    }
    else{
      require("./init/process/worker.js")(env, cb);
    }
  }
  else require("./init/process/single.js")(env, cb);

  // if      (!env.config.nodes && cluster.isMaster)     require("./init/single.js")(env, cb);
  // else if (env.config.nodes  && cluster.isMaster)     require("./init/master.js")(env, cb);
  // else                                                require("./init/worker.js")(env, cb);


};
