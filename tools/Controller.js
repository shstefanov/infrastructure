
var _ = require("underscore");

var EventedClass = require("./EventedClass");


module.exports = EventedClass.extend("Controller", {
  
  addSubject: function(subject, session, cb){ 
    // returns controller, e.g. this, if access matches
    var accesKeys = _.keys(this.access || {});
    var subjectAccess = _.pick(session, accesKeys);
    if(_.isEqual(subjectAccess, _.result(this, "access"))){
      if(cb) cb(null, true);
      return this.trigger("subject", subject);
    }
    else{
      if(cb) cb(null, false);
      return false;
    }
  },

  removeSubject: function(subject, cb){
    console.log("TODO: controller.removeSubject");
  },

  emitTo: function(subject, event, data){
    this.trigger(subject.id || subject._id || "error", {
      action: event,
      body: data
    });
  },

  handleMessage: function(data, subject, cb){
    // if(data.event) return subject.sockets.trigger(data.event, subject, data.body, cb);
    if(this.methods.indexOf(data.action)!=-1) this[data.action](data.body, subject, cb);
    else cb("Error: Can't find method "+data.action);
  },

  handle: function(subject, socket){
    // binds socket to listen for this controller's events
    var self = this;
    socket.on(this.name, function(data, cb){
      if(data.event) return subject.sockets.trigger(data.event, subject, data.body, cb);
      if(self.methods.indexOf(data.action)!=-1) self[data.action](data.body, subject, cb);
      else cb("Error: Can't find method "+data.action);
    });
  }


});
