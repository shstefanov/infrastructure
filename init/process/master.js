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
      env.i[name].once("disconnect", function(){
        log && console.log("Gracefull success", name)
        log && console.log("Gracefull shutdown for worker:", name );
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
      var worker  = cluster.fork({ INFRASTRUCTURE_CONFIG: str_config });
      
      // listening for 'exit' event and spawning node again
      worker.on("exit", function(){
        delete env.i[name];
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
        
        // Listen for messages
        worker.on("message", function(data){
          // If there is no 'address' property, there is some anomaly
          if(!data.address) return console.log("????", JSON.stringify(data));
          
          // The address is dot notated, split it to it's parts
          var address_parts = data.address.split(".");

          // Targeted node is the first part
          var target_name   = address_parts[0];

          // Resolve targeted worker from workers namespace
          var target = env.i[target_name];
          
          // Parse callbacks, listeners and streams, 
          // they must contain source worker name so 
          // make them to be array of type [worker_name, fn_id]
          if(data.cb && !Array.isArray(data.cb)                  ) data.cb       = [name, data.cb       ];
          else if(data.listener && !Array.isArray(data.listener) ) data.listener = [name, data.listener ];
          else if(data.stream   && !Array.isArray(data.stream)   ) data.stream   = [name, data.stream   ];

          // If target is found, send message to target
          if(target) target.send(data);
          // If target does not exist, may be it is still not initialized
          // pushing data to cache
          else if(cache[target_name]) cache[target_name].push(data);
          else {
            handleMissingTarget(worker, data);
          }
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

  // Run created workers initilization chain
  helpers.chain(nodes_chain)(function(err){
    if(err) return cb(err);
    setTimeout(function(){ cb(null, env); }, 0 );    
  });
  
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

    // Try to handle missing target called from master process
    else handleMissingTarget( env.i.master, sendData );
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

}
