

module.exports = function(env, cb){
  console.log("Init Master here")


  var _       = require("underscore");
  var cluster = require("cluster");
  var helpers = require("../../lib/helpers");
  var config  = env.config;
  var cache   = {};

  var workerNames = _.keys(config.structures);
  _.each(config.structures, function(structure, name){
    var other_worker_names;
    if(Array.isArray(structure)){
      structure = _.extend.apply(_, [{}].concat(structure));
    }
    else structure = _.object([[name, structure]]);
    var node_config = { structures: structure };
    if(node_config.config) {
      helpers.deepExtend(node_config, node_config.config);
      delete node_config.config;
    }
    createWorker(name, node_config);
  });

  

  function createWorker(name, config){
    var worker = env.i[name] = cluster.fork();
    cache[name] = config.msg_cache = [];
    worker.on("exit", function(){createWorker(name, config);});
    worker.once("message", function(){
      var i = env.i;
      worker.send(config);
      worker.on("message", function(data){
        console.log("call address: ", data.address);
        var address_parts = data.address.split(".");
        var target = address_parts[0];
        if(data.cb) data.cb = [name, data.cb];
        if(env.i[target]) env.i[target].send(data);
        else {
          cache[target].push(data);

        }
      });
    })
    
  }


  // cb();
}
