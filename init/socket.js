
module.exports = function(cb){

  var env = this;
  var _ = require("underscore");
  var returnArg = function(a){return a;};

  var SocketsCollection = require("../tools/SocketsCollection");

  var getMethods = function(controllers){
    var result = {};
    for(var i = 0;i<controllers.length;i++) result[controllers[i].name] = controllers[i].methods;
    return result;
  }

  var n = 0;
  function report(n){console.log("Sockets connected: ".yellow+n);}
  this.socketConnection = function(err, socket, session){
    if(err) throw err;
    socket.on("disconnect", function(){report(--n)});
    report(++n);
    socket.on("init", function(namespace, cb){
      
      if(env.pages && _.has(env.pages, namespace)){
        var page = env.pages[namespace];

        // Finding the subject
        page.getSubject(session, function(err, subject){
          
          if(err){ cb(err); return socket.disconnect(); }

          subject.session = session;
          
          // create or get sockets collection and set it to subject
          if(!subject.sockets) subject.sockets = new SocketsCollection(subject);
          subject.sockets.add(socket);
          socket.controllers = _.invoke(page.controllers, "addSubject", subject, socket).filter(returnArg);
          _.invoke(socket.controllers, "handle", subject, socket);

          cb(null, getMethods(socket.controllers));

        });
      }
      else{
        console.log("Wrong namespace - disconnecting socket");
        socket.disconnect();
      }
    });
  };




  cb(null);
};