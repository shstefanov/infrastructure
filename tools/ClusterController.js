
var _ = require("underscore");

var EventedClass = require("./EventedClass");



// In cluster model every controller must have 'subjects' collection
// When multiple controller have same access rights, they can share one collection
// Created in init.js
module.exports = EventedClass.extend("Controller", {


  constructor: function(){
    this.addQueue = {};
    EventedClass.apply(this, arguments);
  },
  

  // This method just responds with true or false if subject have access rights
  // The actual "subject" event will be rised when sibject has socket and session
  addSubject: function(subject, session, cb){
    if(!_.isObject(subject) || !_.isString(subject._id)) {
      cb("Invalid subject");
      return false;
    }


    var existingSubject = this.subjects.get(subject._id);
    // subject exists
    if(existingSubject) return cb(null, true);

    console.log("subjects: ", this.subjects);
    console.log("session: ", session);
    throw new Error("This session should be 'alive'");



    // Check if access is function
    // returns controller, e.g. this, if access matches
    var accesKeys = _.keys(this.access || {});
    var subjectAccess = _.pick(session, accesKeys);
    if(_.isEqual(subjectAccess, _.result(this, "access"))){
      if(cb) cb(null, true);
      //return this.trigger("subject", subject, session);
    }
    else{
      if(cb) cb(null, false);
      return false;
    }
  },

  removeSubject: function(subject){
    // Get subject from collection
    // Destroy session listener
    // Destroy socket listener
    // Remove subject from collection
  },

  // emitTo: function(subject, event, data){
  //   var subjectID = subject.id || subject._id;
  //   if(!subjectID) throw new Error("emitTo requires subject to have .id or ._id property");
  //   var listener = this.lisneresBySubjectID[subjectID];
  //   if(listener) listener({
  //     action: event,
  //     body: data
  //   });
  // },

  handleMessage: function(data, subject, cb){
    // if(data.event) return subject.sockets.trigger(data.event, subject, data.body, cb);
    if(this.methods.indexOf(data.action)!=-1) this[data.action](data.body, subject, cb);
    else cb("Error: Can't find method "+data.action);
  },

  // handle: function(subject, socket){
  //   // binds socket to listen for this controller's events
  //   var self = this;
  //   socket.on(this.name, function(data, cb){
  //     if(data.event) return subject.sockets.trigger(data.event, subject, data.body, cb);
  //     if(self.methods.indexOf(data.action)!=-1) self[data.action](data.body, subject, cb);
  //     else cb("Error: Can't find method "+data.action);
  //   });
  // },


  // Accepting listeners
  // also 'on' method

  createSocket: function(subject, listener){
    var release = false;

    // First, get subject from some queue
    var existingSubject = this.addQueue[subject._id];
    
    // If not exists in queue, add it to queue
    if(!existingSubject) this.addQueue[subject._id] = subject;
    // If exists in queue - then should be removed and released at the end of method
    else {
      release = true;
      subject = existingSubject;
      delete this.addQueue[subject._id];
    }

    subject.socket = new Socket(listener);


    if(release) {
      var subjModel = this.subjects.add( _.omit(subject, ["socket, session"]));
      this.trigger("subject", subjModel);
    }
  },

  createSession: function(subject, session, listener){
    var release = false;

    // First, get subject from some queue
    var existingSubject = this.addQueue[subject._id];
    
    // If not exists in queue, add it to queue
    if(!existingSubject) this.addQueue[subject._id] = subject;
    // If exists in queue - then should be removed and released at the end of method
    else {
      release = true;
      subject = existingSubject;
      delete this.addQueue[subject._id];
    }

    subject.socket = new Session(session, listener);


    if(release) {
      var subjModel = this.subjects.add( _.omit(subject, ["socket, session"]));
      this.trigger("subject", subjModel);
    }
  }



  function Session(subject, data, listener){
    this.listener = listener;
    for(var key in data) this[key] = data[key];
  }

  Session.prototype.save = function(cb){
    this.listener("save", this.serializeData(), cb);
  }

  Session.prototype.serializeData = function(){
    return _.omit(this, _.methods(this));
  }

  Session.prototype.destroy = function(cb){
    this.listener("destroy", null, cb);
  }

  Session.prototype.destroy = function(cb){
    var self = this;
    this.listener("destroy", null, function(err){
      self.listener.drop();
      cb(err);
    });
  }

  function Socket(subject, listener){
    this.listener = listener;
  }

  Socket.prototype.emit = function(data, cb){
    this.listener("emit", data, cb);
  }

  Socket.prototype.disconnect = function(cb){
    var self = this;
    this.listener("disconnect", null, function(err){
      self.listener.drop();
      cb(err);
    });
  }




});
