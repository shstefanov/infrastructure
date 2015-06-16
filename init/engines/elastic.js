

module.exports = function(cb){


  var env = this;
  var config = env.config;
  if(!config.elastic) return cb();

  var elasticsearch = require('elasticsearch');
  var elastic = new elasticsearch.Client(config.elastic);

  elastic.ping({
    requestTimeout: config.elastic.connect_timeout || 5000,
  },function(err){
    if(err) return cb(err);
    env.engines.elastic = elastic;
    cb();
    
  });


  // var client = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1', config.redis.options );
  // // redis.createClient() = redis.createClient(6379, '127.0.0.1', {})

  // client.on("error", function (err) {
  //   env.i.do("log.error", "redis error", err);
  // });

  // client.on("connect", function(){
  //   if(config.redis.password){
  //     client.auth(config.redis.password, function(){

  //     });
  //   }
  // });

  // client.on("ready", function(){
  //   env.engines.redis = client;
  //   cb();
  // });




}