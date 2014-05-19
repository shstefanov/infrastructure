
module.exports = function(cb){

  var env = this;
  var _ = require("underscore");
  var returnArg = function(a){return a;};

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
        page.subject(session, function(err, subject){
          
          if(err){ cb(err); return socket.disconnect(); }

          subject.session = session;
          
          // create or get sockets collection and set it to subject
          if(!subject.sockets) subject.sockets = new env.SocketsCollection();

          socket.controllers = _.invoke(page.controllers, "addSubject", subject, socket).filter(returnArg);
          _.invoke(socket.controllers, "handle", socket);

          cb(null, getMethods(socket.controllers));

        });
      }
      else{
        socket.disconnect();
      }
    });
  };




  cb(null);
};