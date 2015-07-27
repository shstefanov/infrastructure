module.exports = function(env, cb){

  var _ = require("underscore");
  var config = env.config;
  var helpers = require("../../lib/helpers");
  var cache = [];

  var initialized = false;


  process.once("message", function(worker_config){
    var original_do = env.i.do;
    // env.i.do = cacheMessages;

    delete config.structures;
    _.extend(config, worker_config);
    require("./single")(env, function(err){
      if(err) throw err;
      if(err) return process.send(err);
      process.send(null);
      initialized = true;
      cache.forEach(function(args){ env.i.do.apply(env.i, args); });
      cache = [];
      env.i.do("log.sys", "worker", _.keys(worker_config.structures).join(","));
      // env.i.do = original_do;
      cache.forEach(function(args){env.i.do.apply(env.i, args);});
      process.once("message", function(cache){
        process.on("message", processMessage);
        cache.forEach(processMessage);
        cb(null, env)
      });
    });

  });
  process.send(null); // Just initializing communication

  function processMessage(data){

    if(data.run_cb){
      return env.runCallback(data);
    }

    if(data.cb){
      data.args.push(env.deserializeCallback(data.cb));
    }
    else if(data.listener){
      data.args.push(env.deserializeListener(data.listener));
    }
    else if(data.stream){
      data.args.push(env.deserializeStream(data.stream));
    }
    var address_parts = data.address.split(".");
    if(!env.i[address_parts[0]]){ console.error("Can't find target ???");}
    else{
      var doArgs = [data.address].concat(data.args);
      env.i.do.apply(env.i, doArgs);
    }
  }
  
  function deserializeCallback(cb_data){
    cb_data = Array.prototype.slice.call(cb_data);
    return function(){
      process.send({
        run_cb: cb_data,
        args: Array.prototype.slice.call(arguments),
        address: cb_data[0]
      });
    }
    // [source, id];
  }

  function forwardToMaster(address, args){
    var cb = args[args.length - 1];
    var data = {address: address, args: args};
    if(typeof cb === "function"){
      cb = args.pop();
      if(cb.name === "do_stream"){
        data.stream = env.serializeCallback(cb);
      }
      else if(cb.name === "do_listener"){
        data.listener = env.serializeCallback(cb);
      }
      else{
        data.cb = env.serializeCallback(cb);        
      }
    }
    process.send(data);
  }

  env.i.do = function(address){
    var args    = Array.prototype.slice.call(arguments);
    if(!initialized) return cache.push(args);
    var address, cb;
    if(_.isString(args[0])) {
      var address_parts = args.shift().split(/[.\/]/);
      if(!env.i[address_parts[0]]) return forwardToMaster(address, args);
      address = address_parts;
    }
    else                    address = args.shift();
    
    if(_.isFunction(_.last(args))) cb = _.last(args);

    var target = this[address[0]];

    if(!target) {
      return cb && cb("Can't find target: ["+address[0]+"]");
    }
    
   
    if(address.length === 2){
      if(target && _.isFunction(target[address[1]])){
        if(_.isArray(target.methods)){
          if(target.methods && target.methods.indexOf(address[1])!=-1){
            if(target.parseArguments) {
              args = target.parseArguments(args);
              if(args===false) return cb && cb("Invalid arguments");
            }
            target[address[1]].apply(target, args);
          }
          else return cb && cb("Invalid target: ["+address.join(".")+"]");
        }
        else{
          if(target.parseArguments) {
            args = target.parseArguments(args);
            if(args===false) return cb && cb("Invalid arguments");
          }
          target[address[1]].apply(target, args);
        }
      }
      else return cb && cb("Invalid target: ["+address.join(".")+"]");
    }
    else {
      if(!_.isFunction(target.do)) return cb && cb("Can't chain to target (missing 'do' method): ["+address.join(".")+"]");
      return target.do.apply(target, [address.slice(1)].concat(args));
    }
  };


}
