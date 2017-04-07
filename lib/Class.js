var _ = require("underscore");

var with_constructor    = "function @@(){return proto.constructor.apply(this, arguments)}";
var without_constructor = "function @@(){ return parent.apply(this, arguments); };";

var extend = function(name, proto, statics){
  
  var parent = this;
  if(typeof name === "string"){
    if(!/^[a-z][a-z0-9_]*$/i.test(name)){
      name = "child"; // Reset name to "child"
    }
  }
  else{
    statics = proto;
    proto = name;
    name = "child";
  }

  name = parent.__className + "_" + name;
  
  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.

  // if (protoProps && _.has(protoProps, 'constructor')) { //first call parent's constructor, then current
  //   eval("function "+name+"(){return protoProps.constructor.apply(this, arguments)}");
  // } else {
  //   eval("function "+name+"(){ return parent.apply(this, arguments); };");
  // }

  eval((proto && _.has(proto, 'constructor')?with_constructor:without_constructor).replace("@@", name))
  var child = eval(name);

  // Add static properties to the constructor function, if supplied.
  _.extend(child, parent, statics);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function(){
    this.constructor = child; 
  };

  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;
  child.__className = (statics || {}).__className || name;

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (proto) _.extend(child.prototype, proto);

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return eval(name);
};

var Class = function(){
  if(this.initialize) this.initialize.apply(this, arguments);
};
Class.__className = "Class";
// minified version will work faster
// Class.extend = function(name,proto,statics){var parent=this;"string"==typeof name&&/^[a-z][a-z0-9]*$/i.test(name)?name=name:(statics=proto,proto=name,name="child"),name=parent.__className||"child_"+name,eval((proto&&_.has(proto,"constructor")?with_constructor:without_constructor).replace("@@",name));var child=eval(name);_.extend(child,parent,statics);var Surrogate=function(){this.constructor=child};return Surrogate.prototype=parent.prototype,child.prototype=new Surrogate,child.__className=(statics||{}).__className||name,proto&&_.extend(child.prototype,proto),child.__super__=parent.prototype,eval(name)};
Class.extend = extend;
module.exports = Class;




// Original extend function in case evaluating class names is not good idea
// var _ = require("underscore");

// var extend = function(protoProps, staticProps) {
//   var parent = this;
//   var child;

//   // The constructor function for the new subclass is either defined by you
//   // (the "constructor" property in your `extend` definition), or defaulted
//   // by us to simply call the parent's constructor.
//   if (protoProps && _.has(protoProps, 'constructor')) {
//     child = protoProps.constructor;
//   } else {
//     child = function(){ return parent.apply(this, arguments); };
//   }

//   // Add static properties to the constructor function, if supplied.
//   _.extend(child, parent, staticProps);

//   // Set the prototype chain to inherit from `parent`, without calling
//   // `parent`'s constructor function.
//   var Surrogate = function(){ this.constructor = child; };
//   Surrogate.prototype = parent.prototype;
//   child.prototype = new Surrogate;

//   // Add prototype properties (instance properties) to the subclass,
//   // if supplied.
//   if (protoProps) _.extend(child.prototype, protoProps);

//   // Set a convenience property in case the parent's prototype is needed
//   // later.
//   child.__super__ = parent.prototype;

//   return child;
// };

// var Class = function(){
//   if(this.initialize) this.initialize.apply(this, arguments);
// };
// Class.prototype.extend = extend;

// module.exports = Class;
