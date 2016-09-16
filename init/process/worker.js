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
      env.i.do = DO;//Replace caching caller
      cache.forEach(processMessage);//Process recieved cache
      local_cache.forEach(function(args){ env.i.do.apply(env.i, args); });//Process locally cached messages
      delete local_cache;
      env.i.do("log.sys", "worker", _.keys(config.structures).join(","));//Report that node is initialized to logger
      process.on("message", processMessage);
      env.stops.push(function(cb){ process.removeAllListeners(); cb(); });//Add final stop function - it will remove all intervals or timeouts
      cb(null, env);
    });
  });

  function processMessage(data){
    if(data.run_cb) return env.runCallback(data);
    if(data.run_listener) return env.runListener(data);
    if(data.drop_listener) return env.dropListener(data);
    
    if(data.cb) data.args.push(env.deserializeCallback(data.cb));
    else if(data.listener) data.args.push(env.deserializeListener(data.listener));
    var doArgs = [data.address].concat(data.args);
    env.i.do.apply(env.i, doArgs);
  }
  
  function forwardToMaster(address, args){
    var cb = args[args.length - 1];
    var data = {address: address, args: args};
    if(typeof cb === "function"){
      cb = args.pop();
      if(cb.name === "do_listener") {
        data.listener = env.serializeListener(cb);
        // Add cb.drop here !!! ???
      }
      else  data.cb = env.serializeCallback(cb);
    }
    process.send(data);
  }

  function respond(args, msg){
    var cb = _.last(args);
    if(_.isFunction(cb)) cb(msg instanceof Error ? msg.stack : msg);
  }

  var no_target = "Can't find target: ", 
      sl = Array.prototype.slice, 
      resolve = env.helpers.resolve
      i = env.i;

var DO = function(address){
  var args=sl.call(arguments,1),parts=address.split("."),root=i[parts[0]]
  if(!root) return forwardToMaster(address,args)
  var last=parts.pop(),ctx=resolve(i, parts.join("."))
  if(!ctx||!(_.isFunction(ctx[last]))) return respond(args,no_target+address)
  var whitelist=ctx.callable||ctx.methods;
  if(whitelist&&whitelist.indexOf(last)===-1) return respond(args,no_target+address)
  if(ctx.parseArguments) try{args=ctx.parseArguments(args)}catch(err){respond(args,err)}
  try{ctx[last].apply(ctx,args)}catch(err){respond( args,err)}
};

}
