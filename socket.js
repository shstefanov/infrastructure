var helpers = require("./helpers");

var SocketService = function(name, service, socket, socket_session, app){
  var self = this;
  
  this.name = name;
  this.app = app;
  this.socket = socket;
  this.db = app.db;
  this.session = socket_session;
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
      if(method != "initialize" && method != "auth" && method != "emit" && method != "name")
      api.push(method);
    }
    socket.emit(name, {
      action: "service_index",
      body: api
    });
  };

  this.next = function(data){
    self[data.action].apply(self, arguments);
  };

  this.socket.on(name, function(data){
    //Blocking clientside initialization of object
    if(typeof self[data.action] === "function" 
      && data.action != "initialize" 
      && data.action != "next" 
      && data.action != "auth"){
      if(self.auth){
        self.auth.apply(self, arguments);
      }
      else{
        self.next(data);
      }
      
    }
  });

};

//called in index.js (socketInitializer)
module.exports.connect = function(app, io, config, models){ 

  var sockets = io.sockets
  io.clientsCount++;

  //Loading available services
  var services = helpers.loadDirAsObject(config.socketIoServicesFolder);

  console.log(("Clients connected:".blue+"[".yellow+io.clientsCount+"]".yellow));

  //On connection handler
  return function(err, socket, session){
   
    var count = 0;

    //Binding socket to available for this page services
    for(name in services){
      var serviceName = name;
      var service_handler = new SocketService(name, services[name], socket, session, app);
    }

    socket.emit("ready"); //sending signal to load the client app

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
