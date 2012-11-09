var _ = require("underscore");

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

module.exports.connect = function(app, io, config, services){

  var sockets = io.sockets
  return function(err, socket, session){
    socket.on("ok", function(data){socket.emit("ok", data);});
    socket.user = eventBus.add(socket, session);

    //Broadcasting to all connected
    sockets.emit("visitorsOnline", io.clientsCount);
    socket.on("disconnect", module.exports.disconnect);
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    
  };
};
