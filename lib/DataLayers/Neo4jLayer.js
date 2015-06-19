var _          = require("underscore");
var DataLayer  = require("./DataLayer");
var helpers    = require("../helpers");

// https://github.com/haio/neo4j-io

module.exports = DataLayer.extend("Neo4jLayer", {

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

  parseOptions: function(data, options){
    if(!options.labels) options.labels = "";
    if(!data) options.properties = "";
    else{
      var properties = _.pick(data, _.without(this.publicFields || _.keys(this.fields), this.primaryKey));
      options.properties = "{"+_.keys(properties).map(function(prop){
        return [prop, ": ", "#", prop].join("");
      }).join(", ")+"}";
    }
  },

  formatResult: function(result){
    if(Array.isArray(result)) result = result.pop();
    return _.extend(result.data, _.object([[this.primaryKey, result.metadata.id]]));
  },

  create: function(obj, options, cb){
    var self = this;
    var properties = _.pick(obj, _.without(this.publicFields || _.keys(this.fields), this.primaryKey));
    if(_.keys(properties).length === 0) return cb("Error: empty object");
    this.query("CREATE (@nodeName@labels @properties) RETURN @nodeName", {values: properties, options: options}, function(err, result){
      if(err) return cb(err);
      cb(null, self.formatResult(result[0]));
    });
  },

  find: function(pattern, options, cb){
    var self = this;
    if(typeof pattern === "number" || typeof pattern === "string"){
      this.neo4j.Node.get(pattern).then(function(result){
        cb(null, self.formatResult(result));
      }).catch(function(err){cb(err);});
    }
    else if(Array.isArray(pattern) && _.every(pattern, function(p){return typeof p === "number" || typeof p === "string"})){
      this.query("MATCH (@nodeName@labels) WHERE ID(@nodeName) IN ["+this.neo4j.escape(pattern)+"] RETURN @nodeName", {values: false, options: options}, function(err, result){
        if(err) return cb(err);
        cb(null, result.map(function(r){return self.formatResult(r);}));
      });
    }
    else if(_.isObject(pattern)){
      var properties = _.pick(pattern, _.without(this.publicFields || _.keys(this.fields), this.primaryKey));
      if(_.keys(properties).length === 0) return cb(null, []);
      this.query("MATCH (@nodeName@labels) WHERE "+_.keys(properties).map(function(prop){
        if(Array.isArray(properties[prop])){
          return ["@nodeName", ".", prop, " IN ", "[", properties[prop].map(function(val){
            return self.neo4j.escape(val);
          }), "]"].join("");
        }
        return ["@nodeName", ".", prop, "=", "#", prop].join("");
      }).join(" AND ")+" RETURN @nodeName", {values: properties, options: options}, function(err, result){
        if(err) return cb(err);
        cb(null, result.map(function(r){return self.formatResult(r);}));
      });
    }
  },

  update:  function(pattern, options, cb){
    // http://neo4j.com/docs/stable/query-set.html
  },

  delete:  function(pattern, options, cb){ 
    
  },

  
}, {

  setupDatabase: function(self, env){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupStore(self, env, cb); }
  },

  setupStore: function(instance, env, cb){
    instance.neo4j = env.engines.neo4j;
    instance.query = function(query, data, cb){
      _.extend(data.options, {nodeName: instance.nodeName, debug: data.options.debug || this.options.debug });
      this.parseOptions(data.values, data.options);
      var query = this.neo4j.format(query, data, cb);
      if(query === false) return cb("Invalid query");
      if(data.options.debug){
        env.i.do("log.debug", ["[ Neo4j debug ]",
          [ " V V V V V V V V V V V V V V V V ","==============================================================================================>>>",
            data.options.debug,
            "Neo4j>  "+query,
            "DATA> "+JSON.stringify(data.values),
            "==============================================================================================<<<",""
          ].join("\n")
        ]);
        delete data.options.debug;
      }
      this.neo4j.query(query, data.values).then(function(result){ cb(null, result.data); }).catch(cb);
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});
