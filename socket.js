var async = require("async");
var ServiceBuilder = require("./service.js");

// Extending async
async.simpleCompose = function (fns) {
  return function () {
    var that = this;
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    async.reduce(fns, args, function (newargs, fn, cb) {
      fn.apply(that, newargs.concat([function () {
        var err = arguments[0];
        var nextargs = Array.prototype.slice.call(arguments, 1);
        cb(err, nextargs);
      }]))
    },
    function (err, results) {
        callback.apply(that, [err].concat(results));
    });
  };
};



var colors = require("colors");

var clientsCount = 0;

module.exports.connect = function(app, io, config, cb){ 

  app.sockets = io.sockets

  var handleModelBuilders = async.simpleCompose(app.pluginsMap.modelsBuilders);


  //On connection handler
  return function(err, socket, session){
    if(err) throw err;
    if(!session){ return;}
    clientsCount++;

    var user_data = {};
    var count = 2;
    var checkReady = function(){
      count--;
      if(count==0){
        console.log()
        socket.emit("ready", user_data);
      }
    }

    if(app.pluginsMap.modelsBuilders.length>0){
      session.services.push("models");
      handleModelBuilders({
          socket:socket,
          session:session,
        }, function(err, data){
          user_data.schemas = data.schemas;
          checkReady();
        });
    }
    else{
      checkReady();
    }

    ServiceBuilder.call(app, err, socket, session, function(services){
      user_data.services = services;
      checkReady();
    });

  };
};

module.exports.disconnect = function(app, io){
  return function(){
    clientsCount--;
    console.log(("Clients connected:"+"[".red+(""+clientsCount).green+"]".red));
  };
};
