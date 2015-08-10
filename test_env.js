var cluster        = require("cluster");
var infrastructure = require("./index.js");

module.exports.start = function(config, cb){

  module.exports.stringified_config = JSON.stringify(config);

  if(config.process_mode === "cluster" && cluster.isMaster){
    cluster.setupMaster({
      exec: __filename,
      args: [ module.exports.stringified_config ]
    });
  }

  var config_copy =  JSON.parse(module.exports.stringified_config);
  config_copy.mode = "test";
  infrastructure( config_copy, function(err, env){
    if(err) return cb(err);
    module.exports.env = env;
    cb(null, env);
  });
}

module.exports.stop = function(cb){
  module.exports.env.stop(function(err){
    if(err) return cb(err);
    delete module.exports.env;
    delete module.exports.stringified_config;
    cb(null);
  });
};

if(cluster.isWorker){
  module.exports.start(JSON.parse(process.argv[2]), function(err){
    if(err) return console.error(err);
  });
}
