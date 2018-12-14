
module.exports = function(cb){

  if(!this.config.db) return cb();
  
  var createURL = function(conf){
    var cr = "";
    if(conf.username && conf.password) cr = conf.username+":"+conf.password+"@";
    return "mongodb://"+cr+(conf.host||"localhost")+":"+(conf.port||"27017")+"/"+(conf.database||conf.db);
  };

  var env         = this;
  var config      = this.config;
  var mongodb     = env.MongoDB   = require("mongodb");
  var MongoClient = mongodb.MongoClient;

  env.createMongoConnection = function(cfg, callback){
    MongoClient.connect(createURL(cfg), cfg.options || {}, callback);
  };

  // using native_parser if available:
  // MongoClient.connect('mongodb://127.0.0.1:27017/test'
  //   , {db: {native_parser: true}}, function(err, db) {});
  env.createMongoConnection(config.db, function(err, db){
    if(err) return cb(err);
    env.db = db;
    env.MongoDB = mongodb;
    cb();
  });

};