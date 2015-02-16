
module.exports = function(cb){

  var createURL = function(conf){
    var cr = "";
    if(conf.username && conf.password) cr = conf.username+":"+conf.password+"@";
    return "mongodb://"+cr+(conf.host||"localhost")+":"+(conf.port||"27017")+"/"+(conf.database||conf.db);
  };

  var env          = this;
  var config       = this.config;
  var mongodb      = env.MongoDB   = require("mongodb");
  var MongoClient  = mongodb.MongoClient;

  // Setup helpers
  env.ObjectID     = mongodb.ObjectID;
  env.DBRef        = mongodb.DBRef;
  env._.isObjectID = function(val){ return val instanceof env.ObjectID; };
  env._.isDBRef    = function(val){ return val instanceof DBRef;        };
  
  env.createMongoConnection = function(cfg, callback){
    MongoClient.connect(createURL(cfg), cfg.options || {}, callback);
  };

  env.createMongoConnection(config.mongodb, function(err, db){
    if(err) return cb(err);
    env.db = db;
    env.MongoDB = mongodb;
    env.sys("init", "Connected to MongoDB on "+(config.mongodb.host || "localhost")+":"+(config.mongodb.port||27017));
    cb();
  });

};