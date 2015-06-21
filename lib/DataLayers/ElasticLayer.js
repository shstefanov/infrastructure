var _          = require("underscore");
var DataLayer  = require("./DataLayer");
var helpers    = require("../helpers");

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
// http://joelabrahamsson.com/elasticsearch-101/


function isFound(result){return result.found;}

module.exports = DataLayer.extend("ElasticLayer", {


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

  create:  function(obj, options, cb){
    var self  = this;
    var data  = _.pick(obj, _.without( this.publicFields || _.keys(this.fields), this.primaryKey));
    var query = {
      index: this.indexName,
      type: options.type || this.defaultType,
      body: data
    }

    if(obj.hasOwnProperty(this.primaryKey)){
      query.id = obj[this.primaryKey];
    }

    this.elastic.index(query, function(err, result){
      if(err) return cb(err);
      obj[self.primaryKey] = result._id;
      cb(null, obj);
    });
  },

  find:    function(pattern, options, cb){
    var self = this;
    if(!pattern){
      this.elastic.search({index: this.indexName}, function(err, response){
        if(err) return cb(err);
        cb(null, response.hits.hits.map(function(result){
          return _.extend(result._source, _.object([[self.primaryKey, result._id]]));
        }));
      }); 
    }
    else if(typeof pattern === "string" || typeof pattern === "number"){
      this.elastic.get({
        index: this.indexName,
        type: options.type || this.defaultType,
        id: pattern
      }, function(err, result){
        if(err) return cb(err);
        if(!result) return cb(null, null);
        var object = result._source;
        object[self.primaryKey] = result._id;
        cb(null, object);
      });
    }
    else if(Array.isArray(pattern)){
      if(_.every(pattern, function(val){ return typeof val === "string" || typeof val === "number"  })){
        this.elastic.mget({
          index: this.indexName,
          type:  options.type || this.defaultType,
          body:  { ids: pattern }
        }, function(err, response){
          if(err) return cb(err);
          cb(null, response.docs.map(function(result){
            if(!isFound(result)) return null;
            return _.extend(result._source, _.object([[self.primaryKey, result._id]]));
          }));
        });  
      }
      else{
        var query = [];
        for(var i=0;i<pattern.length;i++){
          if(pattern[i].type){
            query.push(_.extend({index: this.indexName}, pattern[i]));
          }
          else{
            query.push({index: this.indexName});
            query.push(pattern);
          }
        }
        this.elastic.msearch({ body: query }, function(err, responses){
          if(err) return cb(err);
          cb(null, responses.responses.map(function(response){
            return response.hits.hits.map(function(result){
              return _.extend(result._source, _.object([[self.primaryKey, result._id]]));
            });
          }));
        });  
      }
    }
    else if(_.isObject(pattern)){
      var query = {index: this.indexName};
      if(options.type) query.type = options.type;
      query.body = pattern;
      this.elastic.search(query, function(err, response){
        if(err) return cb(err);
        cb(null, response.hits.hits.map(function(result){
          return _.extend(result._source, _.object([[self.primaryKey, result._id]]));
        }));
      });  
    }
  },

  count: function(pattern, options, cb){
    var countQuery = { index: this.indexName };
    if(options.type) countQuery.type = options.type;
    if(pattern) countQuery.body = pattern;
    this.elastic.count(countQuery, function(err, result){
      if(err) return cb(err);
      cb(null, result.count);
    });
  },
  update:  function(pattern, options, cb){
    var self = this;
    if(Array.isArray(pattern)){
      if(_.every(pattern, function(doc){return doc.hasOwnProperty(self.primaryKey);})){
        helpers.chain([
          function(cb){self.find(_.pluck(pattern, self.primaryKey), options, function(err, objects){
            if(err) return cb(err);
            cb(null, objects.map(function(object, index){
              if(object === null) return null;
              return _.extend(object, _.pick(pattern[index], self.publicFields || _.keys(self.fields) ) );
            }));
          })},
          function(results, cb){
            helpers.amap(results, function(object, cb){ self.update(object, options, cb); }, cb);
          }
        ])(cb);
      }
      else{
        cb("Error - cant handle updates");
      }
    }
    else if(_.isObject(pattern)){
      var query = {index: this.indexName};
      if(options.type) query.type = options.type;
      else query.type = this.defaultType;
      if(pattern.hasOwnProperty(this.primaryKey)){
        query.id   = pattern[this.primaryKey];
        var props =  _.pick(pattern, this.publicFields || _.keys(this.fields));
        query.body = {doc: _.omit(props, [this.primaryKey])};
        this.elastic.update(query, function(err, result){
          if(err) return cb(err);
          cb(null, _.extend(query.body.doc, _.object([[self.primaryKey, result._id]])) );
        });
      }

      else{
        helpers.chain([
          options.where? function(cb){self.find(options.where, options, cb)} : function(cb){self.find(null, options, cb);},
          function(results, cb){
            helpers.amap(results, function(object, cb){
              self.update(_.extend(object, _.pick(pattern, self.publicFields || _.keys(self.fields))), options, cb);
            }, cb);
          }
        ])(cb);
      }
    }
  },

  delete:  function(pattern, options, cb){ 
    
    if(typeof pattern === "string" || typeof pattern === "number"){
      this.elastic.delete({
        index: this.indexName,
        type:  options.type || this.defaultType,
        id:    pattern
      }, cb);
    }
    else if(pattern.hasOwnProperty(this.primaryKey)){
      this.elastic.delete({
        index: this.indexName,
        type:  options.type,
        id:    pattern[this.primaryKey]
      }, cb);
    }

    else{
      var query = _.extend(_.clone(pattern), { index: this.indexName });
      query.type = options.type || this.defaultType;
      query.body = pattern;

      this.elastic.deleteByQuery(query, cb);
    }



  },

  
}, {

  setupDatabase: function(self, env, name){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupStore(self, env, function(err){
      if(err) return cb(err);
      env.i.do("log.sys", "DataLayer:elasticsearch", name);
      cb();
    }); }
  },


  setupStore: function(instance, env, cb){
    instance.elastic = env.engines.elastic;
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});


  
