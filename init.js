var _       = require("underscore");
var cluster = require("cluster");

module.exports = function(env, cb){

  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");

  var _      = require("underscore");
  var bulk   = require("bulk-require");

  env.testSetup = [];
  env.stops     = [];

  env.stop = function(cb){ env.helpers.chain(env.stops)(cb); };

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
      env.helpers.traverse(env.i[name], function(target, nodeName, parent){
        if( nodeName === "do" || (nodeName === "stop" && parent === env.i[name].__run  )    ) return;
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
      env.i[name].__run = { stop: env.stop };
      
      if(initializers.length) env.helpers.chain(initializers)(cb, env);
      else                                                    cb(); 
    }

  }

  env.engines = {};
  env.i       = {};
  env.classes = {};



  if(config.process_mode === "cluster"){

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
        if(!fn.isListener && !fn.isStream){
          env.dropCallback({drop_cb: data.run_cb});
        }
      }
    }

    env.dropCallback = function runCallback(data){
      var fn = callbacks[data.drop_cb[1]];
      if(fn) {
        delete callbacks[data.drop_cb[1]];
      }
    }

    var cluster = require("cluster");
    if(cluster.isMaster){
      require("./init/process/master.js")(env, cb);
    }
    else{

      env.deserializeCallback = function deserializeCallback(cb_data){
        var cb = Array.prototype.slice.call(cb_data);
        return function(){
          process.send({
            address: cb[0],
            run_cb: cb,
            args: Array.prototype.slice.call(arguments)
          });
        }
      }

      env.deserializeStream = function deserializeStream(stream_data){
        var stream = Array.prototype.slice.call(stream_data);
        var deserialized = function(){
          process.send({
            address: stream[0],
            run_cb: stream,
            args: Array.prototype.slice.call(arguments)
          });
        }
        deserialized.end = function(){ process.send({ address: stream[0], drop_cb: stream }); }
        return deserialized;
      }

      env.deserializeListener = function deserializeListener(listener_data){
        var listener = Array.prototype.slice.call(listener_data);
        var deserialized = function(){
          process.send({
            address: listener[0],
            run_cb: listener,
            args: Array.prototype.slice.call(arguments)
          });
        }
        deserialized.drop = function(){ process.send({ address: listener[0], drop_cb: listener }); };
        return deserialized;
      }


      require("./init/process/worker.js")(env, cb);
    }
  }
  else {
    // Flatten partial configurations in structures
    if(config.structures){
      _.each(config.structures, function(structure){
        if(structure.config){
          var partial_config = structure.config;
          _.extend(config, partial_config);
          delete structure.config;
        }
      });
    }


    env.i.do = function(address){
      var args          = Array.prototype.slice.call(arguments);
      var address       = args[0];
      var address_parts = address.split(".");
      var root          = env.i[address_parts[0]];
      if(!root) return forwardToMaster(address, args.splice(1));
      var last          = _.last(address_parts);
      var context       = env.helpers.resolve(env.i, address_parts.slice(0, -1).join("."));
      if(!context || !(_.isFunction(context[last]))) return findCbAndRespond(args, "Can't find target: "+address);
      
      if(context.parseArguments) args = context.parseArguments(args.slice(1));
      else args = args.slice(1);
      context[last].apply(context, args);
    };


    require("./init/process/single.js")(env, cb);
  }

  // if      (!env.config.nodes && cluster.isMaster)     require("./init/single.js")(env, cb);
  // else if (env.config.nodes  && cluster.isMaster)     require("./init/master.js")(env, cb);
  // else                                                require("./init/worker.js")(env, cb);


};
