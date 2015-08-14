module.exports = function(env, cb){

  var _ = require("underscore");
  var config = env.config;
  var helpers = require("../../lib/helpers");
  var local_cache = [];
  env.i.do = function(){ local_cache.push(arguments); }

  require("./single")(env, function(err){
    if(err) {
      cb(err);
      return process.send(err);
    }
    process.send(null);
    process.once("message", function(cache){
      env.i.do = DO;
      local_cache.concat(cache).forEach(function(args){ env.i.do.apply(env.i, args); });
      delete local_cache;
      env.i.do("log.sys", "worker", _.keys(config.structures).join(","));
      process.on("message", processMessage);
      env.stops.push(function(cb){ 
        process.removeAllListeners(); cb(); });
      cb(null, env)
    });
  });

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

  function findCbAndRespond(args, msg){
    var cb = _.last(args);
    if(_.isFunction(cb)) cb(msg)
  }

  var DO = function(address){
    var args          = Array.prototype.slice.call(arguments);
    var address       = args[0];
    var address_parts = address.split(".");
    var root          = env.i[address_parts[0]];
    if(!root) return forwardToMaster(address, args.splice(1));
    var last          = _.last(address_parts);
    var context       = env.helpers.resolve(env.i, address_parts.slice(0, -1).join("."));
    if(!context || !(_.isFunction(context[last]))) return findCbAndRespond(args, "Can't find target: "+address);
    
    if(context.parseArguments) {
      var parsed = context.parseArguments(args.slice(1));
      if( parsed === false ) return findCbAndRespond( args, "Invalid arguments" );
      args = parsed;
    }
    else args = args.slice(1);
    context[last].apply(context, args);
  };

}
