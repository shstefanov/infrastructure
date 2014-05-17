
var mongodb = require("mongodb");

module.exports = function(cb){
  var config = this.config;
  var MongoClient = mongodb.MongoClient;
  var dbConnection = "mongodb://"+(config.db.host || "localhost")+":"+(config.db.port || 27017)+"/"+config.db.database
  // using native_parser if available:
  // MongoClient.connect('mongodb://127.0.0.1:27017/test'
  //   , {db: {native_parser: true}}, function(err, db) {});

  var env = this;
  MongoClient.connect(dbConnection, function(err, db) {
    if(err) return cb(["Database error", err.stack ].join("\n").red);
    env.db = db;
    cb(err);
  });

};