var _          = require("underscore");
var DataLayer  = require("./DataLayer");
var helpers    = require("../helpers");

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

  create:  function(obj, options, cb){
    var data = _.pick(this.publicFields || _.keys(this.fields));
    this.neo4j.Node.create(data, cb);
  },

  find:    function(pattern, options, cb){

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
    instance.neo4j = env.engines.neo4j;
    console.log("Setup layer here");
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});
