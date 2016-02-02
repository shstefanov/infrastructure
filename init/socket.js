
module.exports = function(cb){

  var env = this;
  var _ = require("underscore");
  var returnArg = function(a){return a;};

  var SocketsCollection  = require("../tools/SocketsCollection");
  var SessionsCollection = require("../tools/SessionsCollection");

  var getMethods = function(controllers){
    var result = {};
    for(var i = 0;i<controllers.length;i++) result[controllers[i].name] = controllers[i].methods;
    return result;
  }

  var n = 0;
  function report(n){env.log("socket", "open connections: "+n);}
  function decreaseConnections (){report(--n);}
  function socketError(err){console.log("socket error: ", err, err.stack)}
  this.socketConnection = function(err, socket, session){
    
    if(err) {
      console.error(err);
      socket && socket.disconnect();
      session && session.destroy();
    }

    socket.on("error", socketError);
    socket.on("disconnect", decreaseConnections);

    report(++n);

    var t = setTimeout(function(){
      socket.disconnect();
    }, env.config.SocketIdleDisconnectTime || 1000*60);

    socket.on("init", function(namespace, cb){
      clearTimeout(t);
      if(env.pages && _.has(env.pages, namespace)){
        var page = env.pages[namespace];

        // Finding the subject
        page.getSubject(session, function(err, subject){
          
          if(err){ 
            cb(err); 
            socket.disconnect(); 
            return;
          }

          // create or get sockets collection and set it to subject
          if(!subject.socket) subject.socket   = new SocketsCollection (subject);
          if(!subject.session) subject.session = new SessionsCollection(subject);
          subject.socket.add(socket);
          subject.session.add(session);

          socket.controllers = _.invoke(page.controllers, "addSubject", subject, session, socket).filter(returnArg);
          if(socket.controllers.length>0){
            _.invoke(socket.controllers, "handle", subject, socket);
            cb(null, getMethods(socket.controllers));
          }
          else{
            // Disconnecting subjects with no controllers and sending all 
            // controllers functions to them to prevent call functions of 
            // undefined controllers (there is no listeners on serverside)
            cb(null, env._.mapObject(env.controllers, function(name, controller){
              return controller.methods;
            }));
            socket.disconnect();
          }

          return subject;
        });
      }
      else{
        socket.disconnect();
      }
    });
  };

  cb&&cb(null);
};