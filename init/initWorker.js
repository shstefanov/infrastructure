var _          = require("underscore");
var path       = require("path");
var cluster    = require("cluster");

// This object will hold addresators for all types of workers
var workers = {};

var msgTypes = {
  // call:  { 
  //   type: 'call',
  //   address: 'controllers.controller_1.someController.someMethod',
  //   data: { params: {}, query: {}, body: {}, session: { cookie: [Object] } },
  //   cb: 'http.http-1.1' 
  // }
  call: function(data){
    var parts  = data.address.split(".");
    var type   = parts[0];
    var id     = parts[1];
    var group  = workers[type];
    if(!group) return console.log("Can't find type: "+ type);
    var worker = group[id];
    if(!worker) return console.log("Can't find worker: "+ id);

    worker.send(data);
  },

  cb: function(data){
    // cb:  { 
    //   type: 'cb',
    //   cb: 'http.http-1.1',
    //   error: null,
    //   result: { result: 'Some result' } 
    // }
    var parts  = data.cb.split(".");
    var type   = parts[0];
    var id     = parts[1];
    var group  = workers[type];
    if(!group) return console.log("Can't find type: "+ type);
    var worker = group[id];
    if(!worker) return console.log("Can't find worker: "+ id);
    worker.send(data);
  },

  error: function(data){
    // env.send({
    //   type: "error",
    //   message: err,
    //   worker: [config.type, config.id]
    // });
  }
}


var addWorker = module.exports = function(env, type, config, cb){

  var worker = cluster.fork();
  worker.once("message", function(){
    if(!workers[type]) workers[type] = {};
    workers[type][config.id] = worker;
    worker.send(config);
    worker.on("message", function(data){
      if(msgTypes[data.type]) msgTypes[data.type](data);
    });

    // Respawning dead process
    worker.on("exit", function(){
      delete workers[type][config.id];
      addWorker(env, type, config);
    });

    cb && cb(null, worker);
  });
    
}; 
