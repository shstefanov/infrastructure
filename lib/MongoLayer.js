var DataLayer      = require("./DataLayer");
module.exports = DataLayer.extend("MongoLayer", {

  driver: "mongodb",

  create:  function(pattern, options, fields, cb){
    this.collection.insert(pattern, cb);
  },

  find:    function(pattern, options, fields, cb){
    this.collection.find(function(err, cursor){
      if(err) return cb(err);
      cursor.toArray(function(err, docs){
        if(err) return cb(err);
        cb(null, docs);
      });
    });
  },

  findOne: function(pattern, options, fields, cb){
    this.collection.findOne(pattern, options, fields, cb);
  },

  delete:  function(pattern, options, fields, cb){ 
    this.collection.remove(pattern, options, cb);
  },

  update:  function(pattern, options, fields, cb){
    console.log("mongo update: ", arguments);
    this.collection.update(pattern, options, cb);
  }
  
}, {


  setupDatabase: function(self, env){
    var Prototype   = this;
    self.driver     = env.engines.mongodb;
    self.setupNode  = function(cb){ Prototype.createCollection(self, env, cb); }
  },


  createCollection: function(instance, env, cb){
    instance.driver.createCollection(instance.collectionName||instance.name, instance.options || {}, function(err, collection){
      if(err) return cb(err);
      instance.collection = collection;
      if(instance.index){
        var ch = [];
        instance.index.forEach(function(i){
          ch.push(function(cb){
            //TODO - get collection indexes and drop removed if any
            instance.collection.ensureIndex(i.index,i.options||{}, cb); 
          });
        });
        env.helpers.chain(ch)(cb);
      }
      else cb();
    });
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
