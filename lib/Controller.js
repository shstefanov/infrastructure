var _            = require("underscore");
var EventedClass = require("./EventedClass");
var line         = "       ";

module.exports   = EventedClass.extend("Controller", {
  
  constructor: function(env){
    EventedClass.apply(this, arguments);
    env.i.do("log.sys", "controller", this.name);
  }

},{

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return EventedClass.extend.apply(this, arguments);
  },

  baseMethods: _.methods(EventedClass.prototype),
  setMethods: function(parent, child){
    child.methods = _.unique(
      _.difference(
        _.methods(parent).concat(_.methods(child)),
        this.baseMethods
      )
    );
  }

});
