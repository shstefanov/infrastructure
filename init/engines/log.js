
module.exports = function(cb){
  var env    = this;
  var config = env.config;
  var _      = require("underscore");

  if(!config.structures || !config.structures.log) return cb();

  var line      = ".................................";
  var shortline = ".................";

  env.i.log = {__run: { stop: env.stop }};

  _.each(config.structures.log.options, function(val, key, log){
    env.i.log[key] = function(logName, value, cb){
      if(!config.structures.log.options[key]) return cb && cb();
      if(_.isNull(logName) || _.isUndefined(logName)) logName = logName+"";
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("["+key+"]  ["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    }
  });

  env.i.log.do = env.i.do;
  env.i.do("log.sys", "logger", "options: "+_.keys(config.structures.log.options).join(", "));

  cb();


}
