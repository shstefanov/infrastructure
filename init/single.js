module.exports = function(env, cb){
  
  var _    = require("underscore");
  var path = require("path");

  var initChain = env.helpers.chain([
    
    require("./log"          ),
    require("./mongodb"      ),
    require("./mysql"        ),
    require("./postgres"     ),


    require("./dataLayer"    ),
    // require("./models"       ),  


    // require("./websocket"    ),
    // require("./http"         ),
    // require("./pages"        ),
    // // require("./bundles"      ),
    // require("./controllers"  )
  ]);

  var bulk    = require('bulk-require');
  var classes = bulk(path.join(__dirname, "../lib"), ['*.js']);
  _.extend(env, classes);


  var doCache = {};
  env.do = function(address, args, cb){
    if(_.isString(address)) {
      var args    = Array.prototype.slice.call(arguments);
      var address = args.shift();
      var last    = _.last(args);
      if(_.isFunction(last)) cb = last;
      address = address.split(".");
    }
    if(!this[address[0]]) {
      return cb && cb("Can't find target: ["+address[0]+"]");
    }
    
    if(address.length === 2){
      if(this[address[0]] && _.isFunction(this[address[0]][address[1]])){
        if(_.isArray(this[address[0]].methods)){
          if(this[address[0]].methods && this[address[0]].methods.indexOf(address[1])!=-1){
            console.log("args: ", args);
            this[address[0]][address[1]].apply(this[address[0]], args);
          }
          else return cb && cb("Invalid target: ["+address.join(".")+"]");
        }
        else{
          this[address[0]][address[1]].apply(this[address[0]], args);
        }
      }
      else return cb && cb("Invalid target: ["+address.join(".")+"]");
    }
    else {
      if(!_.isFunction(this[address[0]].do)) return cb && cb("Can't chain to target (missing 'do' method): ["+address.join(".")+"]");
      return this[address[0]].do(address.slice(1), args);
    }
  };

  initChain(function(err){ cb(err, env); }, env );


};
