

module.exports = function(cb){


  var env = this;
  var config = env.config;
  if(!config.redis) return cb();

  var redis  = require("redis");
    var client = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1', config.redis.options );
    // redis.createClient() = redis.createClient(6379, '127.0.0.1', {})

    client.on("error", function (err) {
      return cb(err);
    });

    client.on("connect", function(){
      if(config.redis.password){
        client.auth(config.redis.password, function(err){
          if(err) return cb(err);
          env.i.do("log.sys", "redis", "Connected to Redis on "+(config.redis.host || "localhost")+":"+(config.redis.port||5432)+"/"+(config.redis.database||config.redis.db) );
          cb()
        });
      }
    });

    client.on("ready", function(){
      env.engines.redis = client;
      env.i.do("log.sys", "redis", "Connected to Redis on "+(config.redis.host || "localhost")+":"+(config.redis.port||5432)+"/"+(config.redis.database||config.redis.db) );
      cb();
    });




}