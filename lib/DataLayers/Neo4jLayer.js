var _          = require("underscore");
var DataLayer  = require("./DataLayer");
var helpers    = require("../helpers");

// https://github.com/thingdom/node-neo4j/blob/v2/API_v2.md
// http://coffeedoc.info/github/thingdom/node-neo4j/master/
// http://coffeedoc.info/github/thingdom/node-neo4j/master/classes/GraphDatabase.html
// http://stackoverflow.com/questions/29828635/neo4j-simple-authentication

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

  create:  function(obj, options, cb){

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
