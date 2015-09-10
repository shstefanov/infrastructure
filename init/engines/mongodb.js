
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

  var mongodb      = env.engines.MongoDB   = require("mongodb");
  var MongoClient  = mongodb.MongoClient;

  MongoClient.connect(createURL(config.mongodb), config.mongodb.options || {}, function(err, db){
    if(err) return cb(err);
    env.engines.mongodb = db;
    // Setup helpers
    env.helpers.isObjectId = function(val){ return val instanceof mongodb.ObjectId; };
    env.helpers.isDBRef    = function(val){ return val instanceof DBRef;        };
    env.helpers.objectify  = function(val){
      return _.isArray(val)? val.map(mongodb.ObjectID) : mongodb.ObjectID(val);
    };

    env.stops.push(function(cb){ db.close(); cb(); });

    env.i.do("log.sys", "mongodb", "Connected to MongoDB on "+(config.mongodb.host || "localhost")+":"+(config.mongodb.port||27017)+"/"+config.mongodb.db );
    cb();
  });

};
