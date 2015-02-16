var _            = require("underscore");
var EventedClass = require("./EventedClass");
var line         = "       ";

module.exports   = EventedClass.extend("Controller", {
  
  constructor: function(){
    this.env.sys(this.name, "Built: "+line.slice(this.name.length)+this.name);
    EventedClass.apply(this, arguments);
  }

});