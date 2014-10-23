
var _ = require("underscore");

var EventedClass = require("./EventedClass");


module.exports = EventedClass.extend("Controller", {

  constructor: function(){
    this.lisneresBySubjectID = {};
    EventedClass.apply(this, arguments);
  },
  
  addSubject: function(subject, session, cb){
    if(!_.isObject(subject) || !_.isString(subject._id)) {
      cb("Invalid subject");
      return false;
    }

    console.log("session: ", session);
    throw new Error("This session should be 'alive'");




    // returns controller, e.g. this, if access matches
    var accesKeys = _.keys(this.access || {});
    var subjectAccess = _.pick(session, accesKeys);
    if(_.isEqual(subjectAccess, _.result(this, "access"))){
      if(cb) cb(null, true);
      return this.trigger("subject", subject, session);
    }
    else{
      if(cb) cb(null, false);
      return false;
    }
  },

  removeSubject: function(subject){
    if(!_.isObject(subject) || !_.isString(subject._id)) return;
    var events = this._events[subject._id];
    if(!events) return;
    var subjectEvents = events[subject._id];
    if(!subjectEvents) return;
    subjectEvents.forEach(function(evobj){ evobj.callback.drop(); });
    this.lisneresBySubjectID[subject._id].drop();
    this.trigger("removeSubject", subject);
  },

  emitTo: function(subject, event, data){
    var subjectID = subject.id || subject._id;
    if(!subjectID) throw new Error("emitTo requires subject to have .id or ._id property");
    var listener = this.lisneresBySubjectID[subjectID];
    if(listener) listener({
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
  },

  listen: function(subjectID, listener){
    this.lisneresBySubjectID[subjectID] = listener;
    this.on(subjectID, listener);
  }


});
