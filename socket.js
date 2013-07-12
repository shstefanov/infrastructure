var ServiceBuilder = require("./service.js");
var colors = require("colors")

var clientsCount = 0;
//called in index.js (socketInitializer)
module.exports.connect = function(app, io, config, cb){ 

  var sockets = io.sockets
  

  //On connection handler
  return function(err, socket, session){
    if(!session){ return;}
    clientsCount++;
    console.log(("Clients connected:"+"[".red+(""+clientsCount).green+"]".red));
    session.save();
    ServiceBuilder.call(app, err, socket, cb);
  };
  cb();
};

module.exports.disconnect = function(app, io){
  return function(){
    clientsCount--;
    console.log(("Clients connected:"+"[".red+(""+clientsCount).green+"]".red));
  };
};
