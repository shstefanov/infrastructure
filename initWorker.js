
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


var server = new Addresator({
  id:         "server",
  onMessage:  function(data, cb){},
  onError:    function(err, cb){}
});


// This object will hold addresators for all types of workers
var workers = {
  // type: worker || [worker, worker]

};

function sendTo(type, data, cb){
  var obj = workers[type]
  var current = obj;
  if(_.isArray(obj)){
    var current = obj.shift();

  }
}


module.exports = function(env, type, config, cb){

  // config can ba array
  
  var worker = cluster.fork();
  worker.once("message", function(){
    worker.send(config);













    cb(null, worker);
  });



    
}; 
