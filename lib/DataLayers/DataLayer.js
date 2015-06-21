var _ = require("underscore");
var EventedClass = require("../EventedClass");

module.exports = EventedClass.extend("DataLayer", {

  constructor: function(env, Prototype, name){
    this.env = env;
    Prototype.setupDatabase(this, env, name);
    EventedClass.apply(this, arguments);
  }

}, {
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
