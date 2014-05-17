
var Backbone = require("backbone");
var _ = require("underscore");

var mongodb = require("mongodb");

var ObjectID = mongodb.ObjectID;
var DBRef = mongodb.DBRef;
// new mongodb.Long(numberString)
// var ObjectID = mongodb.ObjectID(hexString);
// new mongodb.Timestamp()  // the actual unique number is generated on insert.
// var DBRef = mongodb.DBRef(collectionName, id, dbName);
// new mongodb.Binary(buffer)  // takes a string or Buffer
// new mongodb.Code(code, [context])
// new mongodb.Symbol(string)
// new mongodb.MinKey()
// new mongodb.MaxKey()
// new mongodb.Double(number)  // Force double storage

// Motherships for all models will be Backbone collection



module.exports = function(name, def, env, cb){
  
  var db = env.db;
  var config = env.config;
  var modelPrototype = {idAttribute: config.idAttribute || "_id"};
  env._.debug("", 2, "green", "MODEL FACTORY");
  // var collection = db.createCollection(name, def.options || {}, function(err, collection){
  //   if(err) return cb(err);
  //   var modelClassProps = { db: collection };
  //   var indexes = def.index;
  //   cb(null, Model.extend(name, def.instance, def.static));

  // });
  cb(null, function(){})
};