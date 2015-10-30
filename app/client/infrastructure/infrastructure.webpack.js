module.exports = function(){
  var env = this;
  var _ = require("underscore");
  return env.lib.Bundler.extend("InfrastructureBundler", _.extend(env.config.client.infrastructure, {
  	CONFIG: {
        "SOME_FUNC": function(){ console.log("WHOAAAAAA!!!") },
      },
  }));
}



