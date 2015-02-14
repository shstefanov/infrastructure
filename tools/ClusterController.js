var _ = require("underscore");
var EventedClass = require("./EventedClass");
// In cluster model every controller must have 'subjects' collection
// When multiple controller have same access rights, they can share one collection
// Created in init.js
module.exports = EventedClass.extend("Controller", {

  constructor: function(){
    this.addQueue = {};
    EventedClass.apply(this, arguments);
  }
  
});
