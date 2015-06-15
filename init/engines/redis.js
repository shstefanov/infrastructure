

module.exports = function(cb){


  var env = this;
  var config = env.config;
  if(!config.redis) return cb();

  var redis  = require("redis");
    var client = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1', config.redis.options );
    // redis.createClient() = redis.createClient(6379, '127.0.0.1', {})

    client.on("error", function (err) {
      env.i.do("log.error", "redis error", err);
    });

    client.on("connect", function(){
      if(config.redis.password){
        client.auth(config.redis.password, function(){

        });
      }
    });

    client.on("ready", function(){
      env.engines.redis = client;
      cb();
    });




}