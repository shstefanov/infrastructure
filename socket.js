var async = require("async");
var ServiceBuilder = require("./service.js");


var colors = require("colors");


module.exports.connect = function(app, io, config, cb){ 

  app.sockets = io.sockets

  var socketConnectionHandlers  = async.simpleCompose(app.pluginsMap.socketConnection);
  var sockerReadySignalHandlers = async.simpleCompose(app.pluginsMap.socketReadySignal);


  //On connection handler
  return function(err, socket, session){
    if(!session){ return;} //Preventing bug - socket tries to connect twice, second time without session and with error
    if(err){app.error("Socket connection???", err); return; }

    socketConnectionHandlers({
      app: app,
      socket:socket,
      session:session
    }, function(err, env){
      if(err){app.error("Socket connection plugins", err); return; }
      ServiceBuilder.call(app, err, socket, session, function(err, services){
        if(err){app.error(err); return; }
        sockerReadySignalHandlers({}, function(err, readyData){
          if(err){app.error(err); env.socket.emit("error", err); return; }
          env.socket.emit("ready", readyData);
        });
      });
    });
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    clientsCount--;
    console.log(("Clients connected:"+"[".red+(""+clientsCount).green+"]".red));
  };
};
