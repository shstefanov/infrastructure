module.exports = function(cb){
  var env    = this;
  env.structureLoader("data", function setupDataLayer(name, DataLayer){
    if(!DataLayer.prototype.name) DataLayer.prototype.name = name;
    var instance = new DataLayer(env, DataLayer);
    return instance;
  }, cb );
};
