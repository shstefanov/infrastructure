var _          = require("underscore");
var DataLayer  = require("./DataLayer");
var helpers    = require("./helpers");

module.exports = DataLayer.extend("RedisLayer", {


  parseArguments: function(args){
    switch(args.length){
      case 0: return false;
      case 1:
        if(typeof args[0] !== "function") return false;
        else return [undefined,{},args[0]];
      case 2:
        if(typeof args[1] !== "function") return false;
        else return [args[0],{}, args[1]];
      case 3:
        if(typeof args[2] !== "function") return false;
        else return [args[0],args[1], args[2]];
      default: return false;
    }
  },

  parseResults: function(pattern, options, cb){
    var self = this;
    return function(err, results){

      if(typeof pattern === "number"){
        if(results[0]) return cb(null, _.extend(JSON.parse(results[0]), _.object([[self.primaryKey, parseInt(pattern)]])));
        else return cb(null, null);
      }
      else if(Array.isArray(pattern)){
        return cb(null, pattern.map(function(id, index){
          if(!results[index]) return null;
          var object = JSON.parse(results[index]);
          _.extend(object, _.object([[self.primaryKey, parseInt(id)]]));
          if(options.fields) object = _.pick(object, options.fields);
          return object;
        }));
      }
      else{
        var objects = [];
        for(var key in results){
          var object = JSON.parse(results[key]);
          _.extend(object, _.object([[self.primaryKey, parseInt(key)]]))
          objects.push(options.fields? _.pick(object, options.fields) : object);
        }
        cb(null, objects);
      }
    };
  },

  create:  function(obj, options, cb){
    var data = _.omit(_.pick(obj, _.keys(this.fields)), [this.primaryKey]);
    var primaryKey = primaryKey = ++this.pk;
    this.redis.hmset(this.hashName, primaryKey, JSON.stringify(data), function(err){
      if(err) return cb(err);
      data.primaryKey = primaryKey;
      cb(null, data)
    });
  },

  find:    function(pattern, options, cb){
    if(!pattern) return  this.redis.hgetall(this.hashName, this.parseResults(pattern, options, cb));
    this.redis.hmget(this.hashName, pattern, this.parseResults(pattern, options, cb));
  },

  update:  function(pattern, options, cb){
    var self = this;
    if(Array.isArray(pattern)){
      pattern = pattern.filter(function(obj){
        return obj.hasOwnProperty(self.primaryKey);
      });
      var objIndex = _.indexBy(pattern, this.primaryKey);
      this.find(_.pluck(pattern, this.primaryKey), options, function(err, results){
        if(err) return cb(err);
        var updates = [];
        results.forEach(function(result){
          if(result) {
            var id = result[self.primaryKey];
            _.extend(result, objIndex[id])
            var data = JSON.stringify(_.omit( _.pick(result, self.publicFields || _.keys(self.fields)), [self.primaryKey]));
            updates.push([id, data]);
          }
        });
        updates.push();
        self.redis.hmset.call(self.redis, self.hashName, _.object(updates), function(err){
          if(err) return cb(err);
          cb(null, results);
        });

      });
    }
    else{
      if(!_.has(pattern, this.primaryKey)) return cb("Can't find primary key for update");
      this.find(pattern[this.primaryKey], {}, function(err, object){
        if(err) return cb(err);
        if(!object) return cb("Can't find object");
        _.extend(object, _.pick(pattern, self.publicFields || _.keys(self.fields)));
        var data = JSON.stringify(_.omit(object, [self.primaryKey] ) );

        self.redis.hmset(self.hashName, _.object([[pattern[this.primaryKey], data]]), function(err){
          if(err) return cb(err);
          return cb(null, object);
        });
      });
    }
  },

  delete:  function(pattern, options, cb){ 
    if(typeof pattern === "number"){
      this.redis.hdel(this.hashName, pattern, cb);
    }
    else if(Array.isArray(pattern)){
      var self = this;
      helpers.amap(pattern, function(id, cb){
        self.redis.hdel(self.hashName, id, cb);
      }, cb);
    }
    else if(pattern === null){
      self.redis.hdel(self.hashName, cb);
    }
    
  },

  
}, {

  setupDatabase: function(self, env){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupStore(self, env, cb); }
  },

  setupStore: function(instance, env, cb){
    instance.redis = env.engines.redis;

    instance.redis.hgetall(instance.hashName, function(err, obj){
      if(err) return cb(err);
      if(!obj) {
        instance.pk = 0;
        return cb();
      }

      var keys = _.keys(obj).sort();
      var length = keys.length;
      var last = parseInt(keys.pop());
      instance.pk = last
      cb();
    });

  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});
