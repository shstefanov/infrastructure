
var mongodb = require("mongodb");

var createURL = function(conf){
  var cr = "";
  if(conf.user && conf.password) cr = conf.user+":"+conf.password+"@";
  return "mongodb://"+cr+(conf.host||"localhost")+":"+(conf.port||"27017")+"/"+(conf.database||conf.db);
};

module.exports = function(cb){
  var config = this.config;
  var MongoClient = mongodb.MongoClient;
  
  // using native_parser if available:
  // MongoClient.connect('mongodb://127.0.0.1:27017/test'
  //   , {db: {native_parser: true}}, function(err, db) {});

  var env = this;
  MongoClient.connect(createURL(config.db), function(err, db) {
    if(err) return cb(["Database error", err.stack ].join("\n").red);
    env.db = db;
    cb(err);
  });

};