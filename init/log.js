
module.exports = function(cb){
  var env = this;
  var _   = require("underscore");

  var line      = ".................................";
  var shortline = ".................";

  env.log = {

    info:    function(logName, value, cb){
      if(!env.config.log.info) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("[info]  ["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    },

    sys:     function(logName, value, cb){
      if(!env.config.log.sys) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("[sys]   ["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    },

    warning: function(logName, value, cb){
      if(!env.config.log.warning) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("[warn]  ["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    },

    notice:  function(logName, value, cb){
      if(!env.config.log.warning) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("[notice]["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    },

    error:   function(logName, value, cb){
      if(!env.config.log.error) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("[error] ["+date+"]"+(env.config.address?("["+env.config.address+"]"+shortline.slice(env.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
      cb && cb();
    }

  };

  env.log.do = env.do

  cb();


}
