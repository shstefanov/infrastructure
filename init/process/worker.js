module.exports = function(env, cb){

  var _ = require("underscore");
  var config = env.config;
  var helpers = require("../../lib/helpers");

  var cache, initialized = false;

  process.once("message", function(worker_config){
    delete config.structures;
    helpers.deepExtend(config, worker_config);
    cache = worker_config.msg_cache;
    require("./single")(env, function(err){
      env.i.do("log.sys", "worker", _.keys(worker_config.structures).join(","));
      initialized = true;
      cache.forEach(processMessage);
    });

    process.on("message", processMessage);
  });
  process.send(null); // Just initializing communication

  function processMessage(data){
    if(!initialized) return cache.push(data);
    if(data.run_cb){
      return runCallback(data);
    }

    if(data.cb){
      data.args.push(deserializeCallback(data.cb));
    }
    var address_parts = data.address.split(".");
    if(!env.i[address_parts[0]]){ console.error("Can't find target ???");}
    else{
      var doArgs = [data.address].concat(data.args);
      //console.log("searching address in worker env.i doArgs", doArgs);
      console.log("---------", [data.address].concat(data.args));
      env.i.do.apply(env.i, [data.address].concat(data.args));
    }
    // console.log("handle worker data", JSON.stringify(data));
  }
  
  function deserializeCallback(cb_data){
    cb_data = Array.prototype.slice.call(cb_data);
    return function(){
      process.send({
        run_cb: cb_data,
        args: Array.prototype.slice.call(arguments)
      });
    }
    // [source, id];
  }

  function forwardToMaster(address, args){
    var cb = args[args.length - 1];
    var data = {address: address, args: args};
    if(typeof cb === "function"){
      cb = args.pop();
      data.cb = serializeCallback(cb);
    }
    process.send(data);
  }

  function runCallback(data){
    var fn = callbacks[data.run_cb[1]];
    if(fn) {
      fn.apply(global, data.args);
      delete callbacks[data.run_cb[1]];
    }
  }

  var callbacks = {}, cb_index = 0;
  function serializeCallback(fn){
    cb_index++;
    callbacks[cb_index] = fn;
    return cb_index;
  }

  env.i.do = function(address){
    var args    = Array.prototype.slice.call(arguments);
    var address, cb;
    if(_.isString(args[0])) {
      var address_parts = args.shift().split(/[.\/]/);
      if(!env.i[address_parts[0]]) return forwardToMaster(address, args);
      address = address.parts
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
