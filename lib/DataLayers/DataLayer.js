var _ = require("underscore");
var EventedClass = require("../EventedClass");

module.exports = EventedClass.extend("DataLayer", {

  constructor: function(env, Prototype){
    this.env = env;
    this.fieldsList = this.publicFields || "*";
    Prototype.setupDatabase(this, env);
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
