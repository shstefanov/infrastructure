var _            = require("underscore");
var EventedClass = require("./EventedClass");
var line         = "       ";

module.exports   = EventedClass.extend("Controller", {
  
  constructor: function(env){
    EventedClass.apply(this, arguments);
    env.call("log.sys", ["controller", this.name]);
  }

});
