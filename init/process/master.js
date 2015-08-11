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
    }
    else if(config.mode === "test" && node_config.test){
      helpers.deepExtend( node_base_config, node_config.test );
    }

    _.extend(node_base_config, {structures: _.object([[name, _.omit(structure, ["config"])]])});

    delete node_config.development;
    delete node_config.test;

    return JSON.stringify(node_base_config);
  }


  var cache       = {};
  var nodes_chain = [];
  _.each(config.structures, function( structure, name ){

    var str_config = bundleWorkerConfig( structure, name );
    env.stops.push(function(cb){
      if(!env.i[name]) return cb();
      env.i[name].once("disconnect", function(){
        if(helpers.resolve(config, "structures.log.options.sys")) console.log("Gracefull shutdown for worker:", name );
        cb();
      });
      env.i.do( name + ".__run.stop", function(err){ if(err) console.error(err); }); 
    });

    createWorker(name, str_config);
  });

  function createWorker(name, str_config){
    cache[name]     = [];
    nodes_chain[name === "log" ? "unshift" : "push"](function(cb){
      var worker  = cluster.fork({ INFRASTRUCTURE_CONFIG: str_config });
      worker.on("exit", function(){
        delete env.i[name];
        createWorker(name, str_config);
      });
      worker.once("message", function(err){ // fully initialized or error
        if(err) return cb(err);
        env.i[name] = worker;
        worker.send(cache[name]);
        worker.on("message", function(data){
          if(!data.address) console.log("????", JSON.stringify(data));
          var address_parts = data.address.split(".");
          var target_name   = address_parts[0];
          var target = env.i[target_name];
          if(data.cb && !Array.isArray(data.cb)                  ) data.cb       = [name, data.cb       ];
          else if(data.listener && !Array.isArray(data.listener) ) data.listener = [name, data.listener ];
          else if(data.stream   && !Array.isArray(data.stream)   ) data.stream   = [name, data.stream   ];

          if(target)        target.send(data);
          else              cache[target_name].push(data);
        });
        cb();
      });
      
    });
  }

  helpers.chain(nodes_chain)(function(err){
    if(err) return cb(err);
    cb(null, env);
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
