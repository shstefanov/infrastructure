
var Class = require("./Class");
var _ = require("underscore");

module.exports = Class.extend("SessionsCollection", {
  constructor: function(subject){
    this.subject = subject;
    this.sessions = {};
  },

  add: function(session){
    var self = this;
    if(!this.sessions[session.id]){
      this.sessions[session.id] = session;
      if(_.keys(this.sessions).length===1) this.sessionData = _.omit(_.clone(session), ["id"]);
    }
    return this;
  },

  get: function(prop){
    return this.sessionData[prop];
  },

  set: function(name, value, force){
    if(_.isObject(name) && !force){
      for(var k in name) this.set(k,name[k], true);
      return this;
    }
    this.sessionData[name] = value;
    return this;
  },

  unset: function(props){
    if(!_.isArray(props)) props = [props];
    this.sessionData = _.omit(this.sessionData, props);
    var self = this;
    props.forEach(function(prop){
      for(var key in self.sessions) delete self.sessions[key][prop];
    });
    return this;
  },

  save: function(cb){
    var error = false, session_ids = _.keys(this.sessions), counter = session_ids.length, sessions = this.sessions, sessionData = this.sessionData;
    
    session_ids.forEach(function(id){
      if(error) return;
      var session = sessions[id];
      _.extend(session, sessionData);
      session.save(function(err){
        if(err) {
          error = true;
          return cb(err);
        }
        counter--;
        if(counter===0) return cb();
      });
    });
  },

  destroy: function(cb){
    var error = false, session_ids = _.keys(this.sessions), counter = session_ids.length, sessions = this.sessions;
    session_ids.forEach(function(id){
      if(error) return;
      var session = sessions[id];
      session.destroy(function(err){
        if(err) {
          error = true;
          return cb(err);
        }
        counter--;
        if(counter===0) return cb();
      });
    });
  }

});


