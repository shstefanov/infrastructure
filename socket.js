var _ = require("underscore");
var colors = require("colors");

var helpers = require("./helpers");

var SocketService = function(name, service, socket, app){
  var self = this;

  this.app = app;
  this.socket = socket;
  this.name = name;

  for(member in service){
    this[member] = service[member];
  }
  if(this.initialize && typeof this.initialize === "function"){
    this.initialize();
  }
  this.socket.on(name, function(data){
    if(typeof self[data.action] === "function" && data.action != "initialize"){
      self[data.action].apply(self, arguments);
    }
  });

};

//called in index.js (socketInitializer)
module.exports.connect = function(app, io, config, models){ 

  var sockets = io.sockets
  io.clientsCount++;

  //Loading available services
  var services = helpers.loadDirAsObject(config.socketIoServicesFolder);


  //Loading db socket.io service
  var dbService = require(__dirname+"/dbService.js");

  console.log(("Clients connected:".blue+"[".yellow+io.clientsCount+"]".yellow));

  //On connection handler
  return function(err, socket, session){
    socket.app = app;

    //Binding socket to db service
    dbService(socket, app, config, models.defined);

    //Binding socket to other services
    for(name in services){
      var serviceName = name;
      
      var service = new SocketService(name, services[name], socket, app);
      //socket.on(serviceName, services[serviceName].handler);
      
    }

    //Broadcasting to all connected
    sockets.emit("visitorsOnline", io.clientsCount);

    //Sending desconnect event to the handler
    socket.on("disconnect", module.exports.disconnect);
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    console.log(("Clients connected:"+"[".red+io.clientsCount+"]".red));
    
  };
};
