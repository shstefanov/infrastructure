var DataLayer      = require("./DataLayer");
module.exports = DataLayer.extend("MongoLayer", {

  driver: "mongodb",

  create:  function(obj, cb){
    this.collection.insert(obj, cb);
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
      Prototype.createCollection(self, env, cb);
    }

  },


  createCollection: function(instance, env, cb){
    instance.driver.createCollection(instance.name, instance.options || {}, function(err, collection){
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

  
