module.exports = function(env, cb){

  var _       = require("underscore");
  var cluster = require("cluster");
  var helpers = require("../../lib/helpers");
  var config  = env.config;
  var cache   = {};

  var workerNames = _.keys(config.structures);
  var complete_chain = [];
  _.each(config.structures, function(structure, name){
    var conf        = structure.config;
    structure       = _.object([[name, _.omit(structure, ["config"])]]);;
    var node_config = _.extend((conf || {}), { structures: structure });
    cache[name]     = [];
    var node_ready_cb;
    complete_chain.push(function(cb){node_ready_cb = cb;});
    createWorker(name, node_config, function(err){ node_ready_cb(err); });
  });

  helpers.amap(complete_chain, function(fn, cb){fn(cb);}, function(err){
    if(err) console.log("EEEEE:::::", err);
    if(err) return cb(err);
    cb(null, env);
  });

  function createWorker(name, config, cb){
    var worker = env.i[name] = cluster.fork();

    worker.on("exit", function(){
      delete env.i[name];
      createWorker(name, config);
      worker.initialized = false;
    });

    worker.once("message", function(){
      var i = env.i;
      worker.send(config);
      worker.once("message", function(err){ // fully initialized or error
        
        if(err) return cb && cb(err);

        worker.send(cache[name]);
        cache[name] = [];

        cb && cb();
        worker.initialized = true;


        worker.on("message", function(data){
          if(!data.address) console.log("????", JSON.stringify(data));
          var address_parts = data.address.split(".");
          var target = address_parts[0];
          if(data.cb && !Array.isArray(data.cb)) data.cb = [name, data.cb];
          else if(data.listener && !Array.isArray(data.listener)) data.listener = [name, data.listener];
          else if(data.stream && !Array.isArray(data.stream)) data.stream = [name, data.stream];

          if(env.i[target] && env.i[target].initialized) {
            env.i[target].send(data);
          }
          else {
            if(!cache[target]) cache[target] = [];
            cache[target].push(data);
          }
        });

      });
    })
    
  }



  // function deserializeCallback(cb_data){
  //   cb_data = Array.prototype.slice.call(cb_data);
  //   return function(){
  //     process.send({
  //       run_cb: cb_data,
  //       args: Array.prototype.slice.call(arguments)
  //     });
  //   }
  // }

  env.i.do = function(){
    var args = Array.prototype.slice.call(arguments);
    var address = args[0];
    if(_.isString(address)) address = args.shift().split(".");
    var callback = _.last(args), cb_data;
    if(_.isFunction(callback)) cb_data = ["master", env.serializeCallback(args.pop())];
    else cb_data = undefined;

    var target_name = address[0];
    var target = env.i[target_name];

    if(target && target.send) {
      var sendData = {address: address.join("."), args: args};
      if(cb_data) {
        if     (callback.name === "do_stream"  ) { sendData.stream   = cb_data; callback.isStream   = true; }
        else if(callback.name === "do_listener") { sendData.listener = cb_data; callback.isListener = true; }
        else                                       sendData.cb        = cb_data;
      }
      target.send(sendData);
    }
  }

  env.i.master = {
    initialized: true,
    send: function processMessage(data){
      if(data.drop_cb){
        return env.dropCallback(data);
      }
      else if(data.run_cb){
        return env.runCallback(data);
      }

      // if(data.cb){
      //   data.args.push(deserializeCallback(data.cb));
      // }
      // var address_parts = data.address.split(".");
      // if(!env.i[address_parts[0]]){ console.error("Can't find target ???");}
      // else{
      //   var doArgs = [data.address].concat(data.args);
      //   env.i.do.apply(env.i, doArgs);
      // }
    }
  }



  // cb();
}
