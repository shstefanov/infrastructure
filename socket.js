var ServiceBuilder = require("./service.js");
var colors = require("colors");

var clientsCount = 0;

module.exports.connect = function(app, io, config, cb){ 

  app.sockets = io.sockets

  //On connection handler
  return function(err, socket, session){
    if(err) throw err;
    if(!session){ return;}
    clientsCount++;
    ServiceBuilder.call(app, err, socket, session, cb);
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    clientsCount--;
    console.log(("Clients connected:"+"[".red+(""+clientsCount).green+"]".red));
  };
};
