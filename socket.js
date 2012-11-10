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

module.exports.connect = function(app, io, config){

  var sockets = io.sockets
  io.clientsCount++;

  //Loading available services
  var services = helpers.loadDirAsObject(config.socketIoServicesFolder);

  console.log(("Clients connected:".blue+"[".yellow+io.clientsCount+"]".yellow));

  //On connection handler
  return function(err, socket, session){

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
