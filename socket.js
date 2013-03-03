var helpers = require("./helpers");
var Service = require("./service.js");

//called in index.js (socketInitializer)
module.exports.connect = function(app, io, config, models){ 

  var sockets = io.sockets
  io.clientsCount++;

  //Loading available services
  var services = helpers.loadDirAsObject(config.socketIoServicesFolder);

  console.log(("Clients connected:".blue+"[".yellow+io.clientsCount+"]".yellow));

  //On connection handler
  return function(err, socket, session){
    if(!session) return;
   
    //Binding socket to available for this page services
    var count = 0;
    session.services.forEach(function(serviceName){
      if(!services[serviceName]){
        count++;
        return;
      }
      new Service({
        name: serviceName,
        methods: services[serviceName],
        socket: socket,
        session: session,
        app: app
      });
      count++;
      if(count == session.services.length){ //Ready
        socket.emit("ready"); //sending signal to load the client app

        //Sending desconnect event to the handler
        socket.on("disconnect", module.exports.disconnect);
      }
    });
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    io.clientsCount--;
    console.log(("Clients connected:"+"[".red+io.clientsCount+"]".yellow));
  };
};
