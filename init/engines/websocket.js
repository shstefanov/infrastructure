
module.exports = function(cb){

  var env    = this;
  var config = env.config;
  if(!config.websocket) return cb();

  env.engines.io = require('socket.io');
  env.engines.servers = {};

  cb&&cb(null);
};
