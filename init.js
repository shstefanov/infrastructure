
var mixins = require("./lib/mixins");
module.exports = function(env, cb){
  mixins.apply(env);
  
  var proxy = function(cb){
    env._.debug("", 2, "green", "PROXY IN INIT");
    cb(null);
  };
  
  env._.chain([
    require("./init/tools"        ),
    require("./init/database"     ),
    require("./init/models"       ),
    require("./init/socket"       ),
    require("./init/http"         ),
    require("./init/bundles"      ),
    require("./init/controllers"  ),
    require("./init/pages"        )
  ])(function(err){ cb(err, env)  }, env);

}; 
