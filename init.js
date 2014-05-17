
var mixins = require("./lib/mixins");
module.exports = function(env, cb){
  mixins.apply(env);
  
  var proxy = function(cb){
    env._.debug("", 2, "green", "PROXY IN INIT");
    cb(null);
  };

  // Do all init things here - load pages, create bundles, 
  // compile css with preprocessors, connect to database, 
  // read files and etc..
  env._.chain([
    require("./init/tools"),
    require("./init/database"),
    require("./init/models"),
    require("./socketConnection"),
    require("./init/http"),
    //proxy,
    require("./init/bundles"),
    require("./init/controllers"),
    require("./init/pages")
    // require("./init/absurdMidleware"),
    // debug(2),
  ])(cb, env);

}; 
