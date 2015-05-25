var DataLayer  = require("./DataLayer");
module.exports = DataLayer.extend("MongoLayer", {

  create:  function(obj, options, cb){
    var keys = Object.keys(obj), self = this;
    this.query("INSERT INTO @tableName (@fields) VALUES (#values);", {
      debug: "Тука нещо не е наред",
      fields: keys,
      values: keys.map(function(key){ return obj[key]})
    }, function(err, result){
      if (err) return cb(err);
      obj[self.primaryKey] = result.insertId;
      cb(null, obj);
    });

  },

  find:    function(pattern, options, cb){
    this.collection.find(function(err, cursor){
      if(err) return cb(err);
      cursor.toArray(function(err, docs){
        if(err) return cb(err);
        cb(null, docs);
      });
    });
  },

  findOne: function(pattern, options, cb){
    this.collection.findOne(pattern, options, cb);
  },

  delete:  function(pattern, options, cb){ 
    this.collection.remove(pattern, options, cb);
  },

  update:  function(){
    this.collection.update(pattern, options, cb);
  }
  
}, {


  setupDatabase: function(self, env){
    var Prototype   = this;
    self.driver     = env.mongodb;
    self.buildModel = function(cb){
      Prototype.setupTable(self, env, cb);
    }

  },

  setupTable: function(instance, env, cb){
    instance.mysql = env.mysql;
    if(!instance.tableName) instance.tableName = instance.name;
    var _ = require("underscore"), tableName = instance.tableName;
    instance.query = function(query, data, cb){
      var data = _.extend({}, data, {tableName: tableName});
      if(data.debug){
        console.log("=================================================================>>>");
        console.log("[ "+data.debug+" ]");
        console.log(instance.mysql.format(query, data));
        delete data.debug;
        console.log("=================================================================<<<");
      }
      var debug = instance.mysql.format(query, data);
      return instance.mysql.query(query, data, cb);
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
