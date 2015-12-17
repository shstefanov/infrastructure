var _ = require("underscore");
var EventedClass = require("./EventedClass");

module.exports = EventedClass.extend("DataLayer", {

  primaryKey:     "_id",

  constructor: function(env, structure_name, name){
    var Prototype = this.constructor;
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
