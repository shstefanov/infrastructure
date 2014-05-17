
var EventedClass = require("./EventedClass");
var _ = require("underscore");


module.exports = EventedClass.extend("Sockets", {
  constructor: function(){
    this.sockets = [];
  },

  add: function(socket){
    var self = this;
    this.sockets.push(socket);
    socket.on("disconnect", function(){ self.remove(socket); });
    this.trigger("add", socket);
  },

  remove: function(socket){
    this.trigger("remove", this.sockets.splice(this.sockets.indexOf(socket),1)[0]);
  },

  emit: function(data){
    // {
    //   controller: ...
    //   action:     ...
    //   body:       ...
    // }
    var sockets = _.filter(this.sockets, function(socket){
      return socket.controllers.indexOf(data.controller)>-1;
    });
    _.invoke(sockets, "emit", data.controller.name, _.omit(data, ["controller"]));
  }



});


