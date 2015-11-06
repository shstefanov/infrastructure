module.exports = function(structure_name, cb){

  var _      = require("underscore");
  var env    = this;
  var structure_config = env.config.structures[structure_name];

  env.structureLoader(structure_name, function(name, Prototype){
    return new Prototype(env, structure_name, name);
  }, function(err){
    if(err) return cb(err);

    if(structure_config.instances){
      for(var key in structure_config.instances){
        var prototype = structure_config.instances[key].prototype;
        var Prototype = env.helpers.resolve(env.lib, prototype);
        var NodeClass = Prototype.extend(key, _.omit(structure_config.instances[key], ["prototype"]));
        env.i[structure_name][key] = new NodeClass(env, structure_name, key);
      }
    }

    cb();



    
  }, structure_config.wrapped );


};
