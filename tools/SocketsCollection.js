
var EventedClass = require("./EventedClass");
var _ = require("underscore");

module.exports = EventedClass.extend("SocketsCollection", {
  constructor: function(subject){
    this.subject = subject;
    this.sockets = [];
  },

  add: function(socket){
    var self = this;
    this.sockets.push(socket);
    socket.on("disconnect", function(){ self.remove(socket); });
    this.trigger("add", socket);
    return this;
  },

  remove: function(socket){
    this.trigger("remove", this.sockets.splice(this.sockets.indexOf(socket),1)[0]);
    if(this.sockets.length == 0) this.subject.trigger("disconnect", this.subject);    
  },

  emit: function(controller, event, data){
    for(var i = 0; i<this.sockets.length;i++)
      if(this.sockets[i].controllers.indexOf(controller)!=1)
        this.sockets[i].emit(controller.name, {action: event, body: data});
  },
  disconnect: function(){
    for(var i = 0; i<this.sockets.length;i++)
      this.sockets[i].disconnect();
  }

});


