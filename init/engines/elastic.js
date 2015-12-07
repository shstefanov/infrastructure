

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
    env.i.do("log.sys", "elasticsearch", "Connected to ElasticSearch on "+(config.elastic.host || "localhost:9200"));
    cb();
  });

}