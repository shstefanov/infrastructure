var _ = require("underscore");

module.exports = function(data){
  var self = this;
  
  this.name = data.name;
  this.app = data.app;
  this.socket = data.socket;
  this.session = data.session;
  this.models = this.app.models;

  _.extend(this, data.methods);

  this.emit = function(data){
    self.socket.emit(self.name, data);
  }

  //Sending service api to the client
  this.service_index = function(){
    var api = [];
    for (method in data.methods){
      if(method != "init" && method != "auth" && method != "emit" && method != "name"){
        api.push(method);
      }
    }
    self.socket.emit(self.name, {
      action: "service_index",
      body: api
    });
  };
  this.next = function(data){
    self[data.action].apply(self, arguments);
  };
  
  this.socket.on(this.name, function(data){
    //Blocking clientside initialization of object
    if(typeof self[data.action] === "function" && 
      data.action != "initialize" 
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
  
  if(this.init && typeof this.init === "function"){
    this.init();
  }
  return this;
};
