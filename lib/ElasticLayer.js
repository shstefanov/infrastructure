var _          = require("underscore");
var DataLayer  = require("./DataLayer");
var helpers    = require("./helpers");

// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
// http://joelabrahamsson.com/elasticsearch-101/

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

    /*
      {
        _index: 'posts',
        _type: 'myType',
        _id: '7U_ElH90R1-oH9lXhAsXQA',
        _version: 1,
        created: true 
      }

    */


    this.elastic.index(query, function(err, result){
      if(err) return cb(err);
      obj[self.primaryKey] = result._id;
      cb(null, obj);
    });
  },

  find:    function(pattern, options, cb){
    var self = this;
    if(typeof pattern === "string" || typeof pattern === "number"){
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
  },

  update:  function(pattern, options, cb){
   
  },

  delete:  function(pattern, options, cb){ 
    
  },

  
}, {

  setupDatabase: function(self, env){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupStore(self, env, cb); }
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


  
