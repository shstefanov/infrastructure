
module.exports = function(cb){

  var createURL = function(conf){
    var cr = "";
    if(conf.username && conf.password) cr = conf.username+":"+conf.password+"@";
    return "mongodb://"+cr+(conf.host||"localhost")+":"+(conf.port||"27017")+"/"+(conf.database||conf.db);
  };

  var _            = require("underscore");
  var env          = this;
  var config       = this.config;

  if(!config.mongodb) return cb();

  var mongodb      = env.MongoDB   = require("mongodb");
  var MongoClient  = mongodb.MongoClient;



  env.createMongoConnection = function(cfg, callback){
    MongoClient.connect(createURL(cfg), cfg.options || {}, callback);
  };

  env.createMongoConnection(config.mongodb, function(err, mongodb){
    if(err) return cb(err);
    env.mongodb = mongodb;
    // Setup helpers
    env.helpers.isObjectID = function(val){ return val instanceof env.ObjectID; };
    env.helpers.isDBRef    = function(val){ return val instanceof DBRef;        };
    env.helpers.objectify = function(val){
      return _.isArray(val)? val.map(env.ObjectID) : env.ObjectID(val);
    };
    env.do("log.sys", ["mongodb", "Connected to MongoDB on "+(config.mongodb.host || "localhost")+":"+(config.mongodb.port||27017)+"/"+config.mongodb.db] );
    cb();
  });

};
