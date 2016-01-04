module.exports = function(env, cb){

  var _       = require("underscore");
  var cluster = require("cluster");
  var helpers = require("../../lib/helpers");
  var config  = env.config;

  var base_config = JSON.stringify(_.omit(config, ["structures"]));
  function bundleWorkerConfig(structure, name){
    var node_base_config = JSON.parse(base_config);
    var node_config      = structure.config || {};

    helpers.deepExtend( node_base_config, node_config );

    if(config.mode === "development" && node_config.development){
      helpers.deepExtend( node_base_config, node_config.development );
      delete node_config.development;
    }
    else if(config.mode === "test" && node_config.test){
      helpers.deepExtend( node_base_config, node_config.test );
      delete node_config.test;
    }

    _.extend(node_base_config, {structures: _.object([[name, _.omit(structure, ["config"])]])});

    return JSON.stringify(node_base_config);
  }

  var cache       = {}; // The cache namespace
  var nodes_chain = []; // Nodes initialization chain

  // Flag that indicates that syslog is on
  var log = !!helpers.resolve(config, "structures.log.options.sys");
  _.each(config.structures, function( structure, name ){

    // Push stoper function for this structure
    env.stops.push(function(cb){
      if(!env.i[name]) return cb();
      log && console.log("try Gracefull shutdown for structure: ", name);
      env.i[name].stopping = true;
      env.i[name].once("disconnect", function(){
        log && console.log("Gracefull shutdown success for worker:", name );
        cb();
      });
      env.i.do( name + ".__run.stop", function(err){ if(err) console.error(err); }); 
    });

    // Building node config as stringified json
    var str_config = bundleWorkerConfig( structure, name );
    createWorker(name, str_config);
  });

  function createWorker(name, str_config, avoid_callback){
    // Set the cache that will keep messages
    cache[name]     = [];

    nodes_chain[name === "log" ? "unshift" : "push"](function(cb){
      
      // Passing node config as string vie env var
      var worker  = cluster.fork({ INFRASTRUCTURE_CONFIG: str_config, INFRASTRUCTURE_AUTOLOAD: 1 });
      
      // listening for 'exit' event and spawning node again
      worker.on("exit", function(){
        delete env.i[name];
        // Do not spawn if stop process is goes
        if(worker.stopping) return;
        // Creating the cache
        cache[name]     = [];
        createWorker(name, str_config, true);
      });

      // Waiting node to send it's first message
      worker.once("message", function(err){ // fully initialized or error
        if(err) return cb(err);
        
        // Attaching worker object to workers namespace 'i'
        env.i[name] = worker;

        // If meanwhile other node calls this node before it is initialized, 
        // messages are cached, so send them to the worker
        worker.send(cache[name]);

        // Removing the cache
        delete cache[name];
        
        var i = env.i;
        // Listen for messages
        worker.on("message", function(data){
          if(!data.address) return;
          var target_name  = data.address.split(".")[0];
          var target = i[target_name];
          if(data.cb && !Array.isArray(data.cb) ) data.cb = [ name, data.cb ];
          else if(data.listener && !Array.isArray(data.listener) ) data.listener = [name, data.listener ];
          if(target) target.send(data);
          else if(cache[target_name]) cache[target_name].push(data);
          else handleMissingTarget(worker, data);
        });

        // Node is initialized, calling callback to continue/finish initialization chain
        if(!avoid_callback) cb();
      });
      
    });
  }

  function handleMissingTarget(worker, data){
    // TODO: If has callback - send back error message
    // if stream or listener is present 
    // send back destroy listener/stream message
  }

  var spawn = function(starter){
    starter(function(err){
      if(err) console.error(err);
    });
  };

  // Run created workers initilization chain
  helpers.chain(nodes_chain)(function(err){
    if(err) return cb(err);
    setTimeout(function(){
      nodes_chain = { push: spawn, unshift: spawn };
      cb(null, env); 
    }, 0 );    
  });
  
  var sl = Array.prototype.slice, i = env.i;
  env.i.do = function(){
    var args = sl.call(arguments);
    var address = _.isString(args[0])? args.shift().split("."):args[0];
    var cb = _.last(args), cb_data;
    if(_.isFunction(cb)) cb_data = ["master", env.serializeCallback(args.pop())];
    var target = i[address[0]];
    var data = {address: address.join("."), args: args};
    if(target && target.send){
      if(cb_data) {
        if(cb.name === "do_listener") { data.listener = cb_data; callback.isListener = true; }
        else data.cb = cb_data;
      }
      target.send(data);
    }
    else handleMissingTarget(i.master,data);
  }

  env.i.master = {
    initialized: true,
    send: function processMessage(data){
      // TODO - make master node callable
      if(data.drop_cb){
        return env.dropCallback(data);
      }
      else if(data.run_cb){
        return env.runCallback(data);
      }
    }
  }

}
