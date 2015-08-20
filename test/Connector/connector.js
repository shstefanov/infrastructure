var _           = require("underscore");
var assert      = require("assert");
//var Connector   = require("../../lib/Connector.js");

var Class      = require("../../lib/Class.js"  );
var helpers    = require("../../lib/helpers.js");

var Connector = Class.extend("Connector", {
  constructor: function(env){
    this.env = env;
    Class.apply(this, arguments);
  },

  build: function(target){
    // 1. Match all target properties that must be built
    // 2. Make initiator
    // 3. Make finalizer
    // 4. Chain them and get handler
    // 5. Call binder
  },

  defaultArgGetter: function(){ return []; },
  defaultDataPatcher: function(result, memo){ _.extend(memo, result); },

  parseHandler: function(target, handler, path){
    if(_.isFunction(handler))    return handler;
    else if(_.isString(handler)) return this.createFromString(target, handler, path);
    else if(_.isArray(handler))  return this.createChain(handler);
    else if(_.isObject(handler)) return this.createConcurent(handler);
  },

  createFromString: function(target, handler, path){
    var self          = this;
    var parts         = str.split("|").map(function(s){return s.trim();});
    if(path) parts[2] = path;
    var argGetter     = parts[1]? new Function( "socket, data, result, _", "return [" + parts[1] + "];" ) : this.defaultArgGetter;
    var dataPatcher   = parts[2]? function(data, result){ helpers.patch(result, parts[2], data); }        : this.defaultDataPatcher;
    return function(socket, data, result, cb){
      var do_args = argGetter(socket, data, result, _);
      self.env.i.do.apply(self.env.i, [parts[0]].concat(do_args.concat([function(err, do_result){
        if(err) return cb(err);
        dataPatcher(do_result, result);
        cb( null, socket, data, result );
      }])));
    };
  },
  createChain: function(){

  },
  createConcurent: function(){

  },

});




var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe("Connector" + currentFileMark, function(){
  

  it("Instantiates connextor", function(next){
    var connector = new Connector({}, {});
    assert.equal( connector instanceof Connector, true );
    next();
  });



});