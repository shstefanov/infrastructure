var _ = require("underscore");

var extend = function(name, protoProps, staticProps) {
  
  var parent = this;
  if(typeof name === "string" && /^[a-z]+$/i.test(name)){
    name = name;
  }
  else{
    staticProps = protoProps;
    protoProps = name;
    name = "child";
  }
  var oldClassName = parent.__className || "child";
  name = oldClassName+"_"+name;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.

  if (protoProps && _.has(protoProps, 'constructor')) { //first call parent's constructor, then current
    eval("function "+name+"(){return protoProps.constructor.apply(this, arguments)}");
  } else {
    eval("function "+name+"(){ return parent.apply(this, arguments); };");
  }

  // Add static properties to the constructor function, if supplied.
  _.extend(eval(name), parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  var Surrogate = function(){
    this.constructor = eval(name); 
  };

  Surrogate.prototype = parent.prototype;
  eval(name).prototype = new Surrogate;
  eval(name).__className = (staticProps || {}).__className || name;

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _.extend(eval(name).prototype, protoProps);

  // Set a convenience property in case the parent's prototype is needed
  // later.
  eval(name).__super__ = parent.prototype;

  return eval(name);
};

var Class = function(){
  if(this.initialize) this.initialize.apply(this, arguments);
};
Class.__className = "Class";
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