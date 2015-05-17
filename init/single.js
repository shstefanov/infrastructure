module.exports = function(env, cb){
  
  var _    = require("underscore");
  var path = require("path");

  var initChain = env.helpers.chain([
    require("./log"          ),
    require("./mongodb"      ),
    require("./mysql"        ),
    require("./postgres"     ),
    require("./websocket"    ),
    require("./http"         ),
    require("./pages"        ),
    // require("./bundles"      ),
    require("./controllers"  ),
  ]);

  var bulk    = require('bulk-require');
  var classes = bulk(path.join(__dirname, "../lib"), ['*.js']);
  _.extend(env, classes);

  env.call = function(address, args, cb){
    var parts    = address.split(".");
    var nodeType = parts.shift();
    var target   = env[nodeType];
    if(!target || !_.isFunction(target.call)) return cb && cb("Can't find target: " + nodeType );
    target.call(parts.join("."), args, cb);
  };

  env.dropCallback = function(){};

  env.callTarget = function(address, args, cb){
    var parts    = address.split(".");
    var nodeType = parts.shift();
    var target   = this[nodeType];
    if(!target) return cb && cb("Can't find target: "+nodeType);
    var method   = parts.shift();
    if(!target[method] || !_.isFunction(target[method])) return cb && cb("Can't find method: "+nodeType+"."+ method );
    target[method].call(target, args, cb);
  };

  initChain(function(err){ cb(err, env); }, env );


};
