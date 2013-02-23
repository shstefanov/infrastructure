var _ = require("underscore");
var colors = require("colors");

var helpers = require("./helpers");

var SocketService = function(name, service, socket, session, app){
  var self = this;

  this.name = name;
  this.app = app;
  this.socket = socket;
  this.db = app.db;
  this.session = session;
  this.models = app.db.models;
  this.name = name;


  for(member in service){
    this[member] = service[member];
  }
  if(this.initialize && typeof this.initialize === "function"){
    this.initialize();
  }

  this.emit = function(data){
    self.socket.emit(self.name, data);
  }

  //Sending service api to the client
  this.service_index = function(){
    var api = [];
    for (method in service){
      if(method != "initialize" && method != "auth" && method != "emit")
      api.push(method);
    }
    socket.emit(name, {
      action: "service_index",
      body: api
    });
  };

  this.next = function(data){
    self[data.action].apply(self, data);
  };

  this.socket.on(name, function(data){
    console.log("service call: ", self.name, data);
    //Blocking clientside initialization of object
    if(typeof self[data.action] === "function" 
      && data.action != "initialize" 
      && data.action != "next" 
      && data.action != "auth"){
      if(self.auth){
        console.log("[1]", data);
        self.auth.apply(self, arguments);
      }
      else{
        console.log("[2]", data);
        self.next(data);
      }
      
    }
  });

};

//called in index.js (socketInitializer)
module.exports.connect = function(app, io, config, models){ 
  console.log("before on connection");

  var sockets = io.sockets
  io.clientsCount++;

  //Loading available services
  var services = helpers.loadDirAsObject(config.socketIoServicesFolder);

  console.log(("Clients connected:".blue+"[".yellow+io.clientsCount+"]".yellow));

  //On connection handler
  return function(err, socket, session){
    socket.app = app;
    socket.session = session;

    //Binding socket to available for this page services
    for(name in services){
      var serviceName = name;
      var service = new SocketService(name, services[name], socket, session, app);
    }

    //Broadcasting to all connected
    sockets.emit("visitorsOnline", io.clientsCount);

    //Sending desconnect event to the handler
    socket.on("disconnect", module.exports.disconnect);
  };
};

module.exports.disconnect = function(app, io){
  return function(){
    io.clientsCount--;
    console.log(("Clients connected:"+"[".red+io.clientsCount+"]".yellow));
  };
};
