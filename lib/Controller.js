var _            = require("underscore");
var EventedClass = require("./EventedClass");
var line         = "       ";

module.exports   = EventedClass.extend("Controller", {
  
  constructor: function(env){
    EventedClass.apply(this, arguments);
    env.do("log.sys", ["controller", this.name]);
  }

});
