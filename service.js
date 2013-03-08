var _ = require("underscore");

module.exports = function(data){
  var self = this;
  console.log("Creating service:", data.name);
  
  this.name = data.name;
  this.app = data.app;
  this.socket = data.socket;
  this.session = data.session;
  this.models = this.app.models;

  _.extend(this, data.methods);

  console.log("after extend");

  this.emit = function(data){
    self.socket.emit(self.name, data);
  }

  //Sending service api to the client
  this.service_index = function(){
    var api = [];
    for (method in data.methods){
      if(typeof data.methods[method] == "function" && method != "init" && method != "auth" && method != "emit" && method != "name"){
        api.push(method);
      }
    }
    self.socket.emit(self.name, {
      action: "service_index",
      body: api
    });
  };
  this.next = function(data){
    console.log("in next", data);
    if(typeof self[data.action] == "function")
      console.log("going to action: ", data.action);
      self[data.action].apply(self, arguments);
  };
  console.log("on socket.on");
  this.socket.on(this.name, function(data){
    console.log("service on event:", self.name, data.action, data.body);
    //Blocking clientside initialization of object
    if(typeof self[data.action] === "function" && 
      data.action != "initialize" 
      && data.action != "next" 
      && data.action != "auth"){
        if(self.auth){
          self.auth.apply(self, arguments);
        }
        else{
          console.log("--------going next--------");
          self.next.apply(self, arguments);
        }
      
    }
  });
  
  if(this.init && typeof this.init === "function"){
    this.init();
  }
  return this;
};
