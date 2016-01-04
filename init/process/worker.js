module.exports = function(env, cb){

  var _ = require("underscore");
  var config = env.config;
  var helpers = require("../../lib/helpers");
  var local_cache = [];

  // In some cases the worker may emit messages to other nodes
  // during initialization process, for example - log.sys
  // create mockup caller that will cache all messages
  env.i.do = function(){ local_cache.push(arguments); }

  require("./single")(env, function(err){
    if(err) {
      // TODO - try to call env.stop, then send error message to master
      cb(err);
      return process.send(err);
    }
    // Sending null for error arg, it is first message
    process.send(null);

    // Waiting first response. It will provide cached messages
    process.once("message", function(cache){
      // Change cache caller with the realone
      env.i.do = DO;

      // Process recieved cache
      cache.forEach(processMessage);

      // Process locally cached messages
      local_cache.forEach(function(args){ env.i.do.apply(env.i, args); });
      delete local_cache;

      // Report that node is initialized to logger
      env.i.do("log.sys", "worker", _.keys(config.structures).join(","));
      
      // Listen for messages
      process.on("message", processMessage);

      // Add final stop function - it will remove all intervals or timeouts
      env.stops.push(function(cb){ process.removeAllListeners(); cb(); });
      cb(null, env);
    });
  });

  function processMessage(data){

    if(data.run_cb) return env.runCallback(data);

    if     (data.cb      ) data.args.push(env.deserializeCallback (data.cb)       );
    else if(data.listener) data.args.push(env.deserializeListener (data.listener) );
    else if(data.stream  ) data.args.push(env.deserializeStream   (data.stream)   );
    
    var address_parts = data.address.split(".");
    if(!env.i[address_parts[0]]){
      console.log(address_parts[0])
      console.log(env.i);
      console.error("Can't find target ???");
    }
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

  function respond(args, msg){
    var cb = _.last(args);
    if(_.isFunction(cb)) cb(msg)
  }

  var no_target = "Can't find target: ", 
      sl = Array.prototype.slice, 
      resolve = env.helpers.resolve
      i = env.i;
      
var DO = function(address){
  var args=sl.call(arguments,1)
  var parts=address.split(".")
  var root=i[parts[0]]
  if(!root) return forwardToMaster(address,args)
  var last=parts.pop()
  var ctx=resolve(i, parts.join("."))
  if(!ctx||!(_.isFunction(ctx[last]))) return respond(args,no_target+address)
  var whitelist=ctx.callable||ctx.methods
  if(whitelist&&whitelist.indexOf(last)===-1) return respond(args,no_target+address)
  if(ctx.parseArguments) try{args=ctx.parseArguments(args)}catch(err){respond(args,err)}
  try{ctx[last].apply(ctx,args)}
  catch(err){respond( args,err)}
};

}
