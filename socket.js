var _ = require("underscore");
var colors = require("colors");

var helpers = require("./helpers");

var EventBus = function(){
  //private variables and initialization
  var users = [];
  var services = {};

  //public variables
  _.extend(this, {
    add:function(socket, session){
      //Must be new User(socket, session);
      var user = {
        socket:socket,
        session:session,

        state:{
          id:_.uniqueId("user"),
          connectedAt:new Date()
        }
      }
      this.bind(user);

      return user;
    },

    bind:function(user){
      for(name in services){
        user.socket.on(name, services[name]);
      }
    }
  });
};
var eventBus = new EventBus();

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
    console.log("before for");
    for(name in services){
      var serviceName = name;
      
      console.log(name, serviceName);
      socket.on(serviceName, services[serviceName].handler);
      
    }


    socket.user = eventBus.add(socket, session);

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
