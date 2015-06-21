module.exports = function(cb){
  var env    = this;
  env.structureLoader("data", function setupDataLayer(name, DataLayer){
    if(!DataLayer.prototype.name) DataLayer.prototype.name = name;
    return new DataLayer(env, DataLayer, name);
  }, cb );
};
