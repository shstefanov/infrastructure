
var _ = require("underscore");

var EventedClass = require("./EventedClass");


module.exports = EventedClass.extend("Controller", {
  
  addSubject: function(subject, socket){ 
    // returns controller, e.g. this, if access matches
    var accesKeys = _.keys(this.access || {});
    var subjectAccess = _.pick(subject.session, accesKeys);
    if(_.isEqual(subjectAccess, _.result(this, "access")))
      return this.trigger("socket", socket);
  },

  send: function(action, data){
    return {
      controller: this,
      action:     action,
      body:       data
    };
  },

  handle: function(socket){ 
    // binds socket to listen for this controller's events
    var self = this;
    socket.on(this.name, function(data, cb){
      if(self.methods.indexOf(data.action)!=-1) self[data.action](data.body, cb);
      else cb("Error: Can't find method "+data.action);
    });
  }


});
