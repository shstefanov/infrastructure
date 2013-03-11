var ServiceBuilder = require("./service.js");

//called in index.js (socketInitializer)
module.exports.connect = function(app, io, config, models){ 

  var sockets = io.sockets
  io.clientsCount++;

  //On connection handler
  return function(err, socket, session){
    if(!session){ return;}
    session.save();
    ServiceBuilder.call(app, err, socket, session);
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    io.clientsCount--;
    console.log(("Clients connected:"+"[".red+io.clientsCount+"]".yellow));
  };
};
