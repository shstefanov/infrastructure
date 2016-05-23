var _       = require("underscore");
var cluster = require("cluster");

module.exports = function(env, cb){

  var config = env.config;
  var path   = require("path");
  var fs     = require("fs");

  var _      = require("underscore");
  var bulk   = require("bulk-require");

  var actual_do;

  env.testSetup = [];
  env.stops     = [];

  env.stop = function(cb){ env.helpers.chain(env.stops)(cb); };

  env.getCached = function(target){
    if(!target.__cached) { target.__cached = target.apply(env); }
    return target.__cached;
  };

  env.structureLoader = function(name, setup, cb, cached){
    var structureConfig = env.config.structures[name];
    if(!structureConfig.path && !structureConfig.instances) return cb();
    
    // REMOVE ME - nonsense
    // if(!structureConfig) return cb(new Error("Cant find config: env.config.structures."+name + " structure "+name));
    
    if(structureConfig.path){
      var stagePath = path.join(env.config.rootDir, Array.isArray(structureConfig.path)?structureConfig.path[0]:structureConfig.path);
      if(fs.existsSync(stagePath)) {
        env.i[name] = bulk(stagePath, Array.isArray(structureConfig.path)?structureConfig.path[1]:["**/*.js", "**/*.coffee"]);
      }
      else{
        env.i[name] = {};        
      }
    }
    else{
      env.i[name] = {};        
    }


    var initializers = [], structureInit;

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
      env.helpers.traverse(env.i[name], function(target, nodeName, parent, path){
        if( nodeName === "do" || (nodeName === "stop" && parent === env.i[name].__run  )    ) return;
        if(_.isFunction(target)) {
          var Node;
          if(setup)        Node = setup(nodeName, cached? env.getCached(target) : target, path );
          else if (cached) Node = env.getCached(target);
          else             Node = target;

          if(Node){
            parent[nodeName] = Node;
            if(Node.setupNode) initializers.push(Node.setupNode);
          }
          else delete parent[nodeName];
        }
        else target.do = actual_do;
      });
      env.i[name].__run = { stop: env.stop };
      
      if(initializers.length) env.helpers.chain(initializers)(cb, env);
      else                                                    cb(); 
    }

  }

  env.engines = {};
  env.i       = {};
  env.classes = {};


  function findCbAndRespond(args, msg){
    var cb = _.last(args);
    if(_.isFunction(cb)) cb(msg)
  }


  var no_target = "Can't find target: ", 
    sl = Array.prototype.slice, 
    resolve = env.helpers.resolve,
    i = env.i,
    respond = findCbAndRespond;

var DO = function(address){
  var args=sl.call(arguments,1)
  var parts=address.split(".")
  var root=i[parts[0]]
  if(!root) return respond(args,no_target+address)
  var last=parts.pop()
  var ctx=resolve(i, parts.join("."))
  if(!ctx||!(_.isFunction(ctx[last]))) return respond(args,no_target+address)
  var whitelist=ctx.callable||ctx.methods
  if(whitelist&&whitelist.indexOf(last)===-1) return respond(args,no_target+address)
  if(ctx.parseArguments) try{args=ctx.parseArguments(args)}catch(err){respond(args,err)}
  try{ctx[last].apply(ctx,args)}
  catch(err){respond( args,err)}
};


  // var DO = function(address){
  //   var args          = Array.prototype.slice.call(arguments);
  //   var address       = args[0];
  //   var address_parts = address.split(".");
  //   var root          = env.i[address_parts[0]];
  //   if(!root) return findCbAndRespond(args, "Can't find target: ", address);
  //   var last          = _.last(address_parts);
  //   var context       = env.helpers.resolve(env.i, address_parts.slice(0, -1).join("."));
  //   if(!context || !(_.isFunction(context[last]))) return findCbAndRespond(args, "Can't find target: "+address);
    
  //   if(context.parseArguments) args = context.parseArguments(args.slice(1));
  //   else args = args.slice(1);
  //   context[last].apply(context, args);
  // };


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
        if(!fn.isListener){
          env.dropCallback({drop_cb: data.run_cb});
        }
        fn.apply(global, data.args);
      }
    }

    env.dropCallback = function dropCallback(data){
      var fn = callbacks[data.drop_cb[1]];
      if(fn) delete callbacks[data.drop_cb[1]];
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

      actual_do = env.i.do;

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

    actual_do = DO;
   

    var calls_cache = [];
    env.i.do = function(){
      calls_cache.push(arguments);
    }
    require("./init/process/single.js")(env, function(err){
      if(err) return cb(err);

      env.i.do = DO;

      for(var i=0;i<calls_cache.length; i++){
        DO.apply(env.i, calls_cache[i]);
      }
      delete calls_cache;

      cb(null, env);
    });
  }

};
