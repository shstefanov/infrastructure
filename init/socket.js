
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
  function report(n){console.log("Sockets connected: "+n);}
  this.socketConnection = function(err, socket, session){
    if(err) throw err;
    socket.on("disconnect", function(){report(--n)});
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

          subject.session = session;
          
          // create or get sockets collection and set it to subject
          if(!subject.sockets) subject.sockets = new SocketsCollection(subject);
          subject.sockets.add(socket);
          socket.controllers = _.invoke(page.controllers, "addSubject", subject, socket).filter(returnArg);
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
            }))
            socket.disconnect();
          }

          return subject;
        });
      }
      else{
        console.log("Wrong page - disconnecting socket");
        socket.disconnect();
      }
    });
  };

  cb&&cb(null);
};