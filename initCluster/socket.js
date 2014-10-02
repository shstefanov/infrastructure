
module.exports = function(cb){

  var CloneRPC = require("clone-rpc");
  var env = this;
  var _ = require("underscore");

  var pigeonFactory = new CloneRPC({
    sendData: function(data)  {
      //console.log("socket send---> ", JSON.stringify(data));
      env.node.layers.pigeon.send([env.config.serverAddress, "pigeonry"], data); 
    },
    getData:  function(fn){},
    onClone: function(){}
  });

  env.node.layer("pigeon", function(data){  pigeonFactory.onMessage(data); });
  
  //pigeonFactory.build(env.config.address, {}, function(){ cb&&cb(null); });
  env.node.layers.pigeon.send([env.config.serverAddress, "pigeonry"], { initialize: true }, function(){
    pigeonFactory.build(env.address, {}, function(){ cb&&cb(null); });
  });

  function unsetSessionProps(arr, cb){
    for(var i in arr) delete this[arr[i]];
    this.save(cb);
  }
  function setSessionProps(props_array, cb){
    for(var key in obj) this[key] = obj[key];
  }

  var n = 0;
  function report(n){console.log("Sockets connected: "+n);}
  this.socketConnection = function(err, socket, session){
    if(err) throw err;
    socket.on("disconnect", function(){report(--n)});
    report(++n);

    socket.t = setTimeout(function(){
      socket.disconnect();
    }, env.config.SocketIdleDisconnectTime || 1000*60);

    socket.once("init", function(namespace, cb){
      if(env.pages && _.has(env.pages, namespace)){
        var page = env.pages[namespace];
        page.getSubject(session, function(err, subject){
          if(err) return cb(err);
          socketInitialize(socket, session, subject, page.controllers, cb);
        })
      }
      else{
        cb("Wrong page - disconnecting socket");
        socket.disconnect();
      }
    });
  };

  function socketInitialize(socket, session, subject, controllers, cb){
    clearTimeout(socket.t);
    delete socket.t;

    // Create pigeons here
    // socket
    pigeonFactory.clone(function(p_socket){
      p_socket.setOptions({context: socket});
      p_socket.build({ type: "socket", session: session, controllers: controllers }, {
        availableMethods: ["emit", "on", "once", "disconnect", "initialize"],
        listeners:        ["on"],
        on: socket.on,
        once: socket.once,
        emit: socket.emit,
        disconnect: socket.disconnect,
        initialize: cb
      }, function(){});
    });
    // session
    pigeonFactory.clone(function(p_socket){
      p_socket.setOptions({context: session});
      p_socket.build({ type: "session", session: session }, {
        availableMethods: ["destroy", "save"],
        destroy: session.destroy,
        save:    session.save,
        set:     setSessionProps,
        unset:   unsetSessionProps
      }, function(){});
    });

  }

  cb(null);

  
};