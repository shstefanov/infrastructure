
var mixins     = require("./lib/mixins");
var _          = require("underscore");
var path       = require("path");
var Addresator = require("addresator");
var CloneRPC   = require("clone-rpc");
var cluster    = require("cluster");


var workers = {

  http:           require("./workers/http.js"),
  controller:     require("./workers/controller.js"),
  model:          require("./workers/model.js"),
  front:          require("./workers/front.js"),
  system:         require("./workers/system.js"),
  controlPanel:   require("./workers/controlPanel.js"),
  remote:         require("./workers/remote.js")

};





module.exports = function(env, type, config, cb){
  
  console.log("initializing worker: ", [type, config]);


  var worker = cluster.fork();

  worker.once("message", function(){
    worker.send(config);
    cb(null, worker);
  });



    
}; 
