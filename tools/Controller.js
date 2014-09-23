
var _ = require("underscore");

var EventedClass = require("./EventedClass");


module.exports = EventedClass.extend("Controller", {
  
  addSubject: function(subject, cb){ 
    // returns controller, e.g. this, if access matches
    var accesKeys = _.keys(this.access || {});
    var subjectAccess = _.pick(subject.session, accesKeys);
    if(_.isEqual(subjectAccess, _.result(this, "access"))){
      if(cb) cb(null, true);
      return this.trigger("subject", subject);
    }
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
