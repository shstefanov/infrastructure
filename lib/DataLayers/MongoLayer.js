var _              = require("underscore");
var DataLayer      = require("./DataLayer");
var mongodb        = require("mongodb");
module.exports     = DataLayer.extend("MongoDBLayer", {

  driver: "mongodb",

  parseArguments: function(args){
    switch(args.length){
      case 0: return false;
      case 1:
        if(typeof args[0] !== "function") return false;
        else return [{},{},args[0]];
      case 2:
        if(typeof args[1] !== "function") return false;
        else return [args[0],{}, args[1]];
      case 3:
        if(typeof args[2] !== "function") return false;
        else return [args[0],args[1] || {}, args[2]];
      default: return false;
    }
  },

  create:  function(pattern, options, cb){
    this.collection.insert(pattern, function(err, result){
      cb(err? err : null, err? null : pattern);
    });
  },

  find:    function(pattern, options, cb){
    console.log("mongo find: ", arguments);
    this.collection.find(pattern||{}, options||{}, function(err, cursor){
      if(err) return cb(err);
      cursor.toArray(function(err, docs){
        if(err) return cb(err);
        cb(null, docs);
      });
    });
  },

  count:    function(pattern, options, cb){
    this.collection.count(pattern, options, cb);
  },

  findOne: function(pattern, options, cb){
    this.collection.findOne(pattern, options, cb);
  },

  delete:  function(pattern, options, cb){ 
    this.collection.remove(pattern, options, function(err, response){
      cb(err? err : null, err? null : response.result);
    });
  },

  update:  function(pattern, options, cb){
    if(pattern._id){
      pattern._id = mongodb.ObjectId(pattern._id);
      this.collection.save(_.pick(pattern, this.publicFields || _.keys(this.fields)), function(err, response){
        if(err) return cb(err);
        cb(null, pattern);
      });      
    }
    else {

    }
  }
  
}, {


  setupDatabase: function(self, env, name){
    var Prototype   = this;
    self.driver     = env.engines.mongodb;
    self.setupNode  = function(cb){ Prototype.createCollection(self, env, function(err){
      if(err) return cb(err);
      env.i.do("log.sys", "DataLayer:mongodb", name);
      cb();
    }); }
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

  