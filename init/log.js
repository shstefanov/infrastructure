
module.exports = function(cb){
  var env    = this;
  var config = env.config;
  var _      = require("underscore");

  if(env.nodes && env.nodes.log) return cb();

  if(!config.log) return cb;

  var line      = ".................................";
  var shortline = ".................";

  env.i.log = {};

  _.each(config.log, function(val, key, log){
    env.i.log[key] = function(logName, value, cb){
      if(!env.config.log[key]) return;
      if(_.isNull(logName) || _.isUndefined(logName)) logName = logName+"";
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("["+key+"]  ["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    }
  });

  env.i.log.do = env.i.do

  

  cb();


}
