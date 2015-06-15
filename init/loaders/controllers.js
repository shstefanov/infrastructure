module.exports = function(cb){

  var _      = require("underscore");
  var base   = _.methods(this.classes.Controller.prototype);
  var env    = this;

  env.structureLoader("controllers", function(name, Controller){
    var proto = Controller.prototype;
    _.extend(proto, {env:env, name: name, methods: _.difference(_.methods(proto), base)});
    proto.private?_.extend(proto, proto.private):null;
    delete proto.private;
    return new Controller(env);
  }, cb );

};
