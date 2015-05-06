
module.exports = function(core){

  var env        = this;
  var _          = require("underscore");
  var Combinator = require("combinat"  );
  var Addresator = require("addresator");
  var CloneRPC   = require("clone-rpc" );

  var Pigeonry = new Combinator({
    socket: {
      methods: ["on", "once", "disconnect", "initialize"],
      add : function(socket, session){
        if(!session.subject._id) return;
        return session.subject._id;
      }
    },
    session: {
      methods:["save", "destroy"],
      // TODO limit: 1,
      add: function(session, sessionData){
        if(!sessionData.subject._id) return; 
        return sessionData.subject._id;
      }
    },
    subject: {
      methods:[],
       // TODO limit: 1,
      add: function(subject){ 
        return subject._id; 
      }
    }
  },
  {
    events:{

      "add:socket":  checkState,
      "add:session": checkState,
      "add:subject": checkState,

      "setup:socket": function(socket, sheaf){
        var self = this;
        var subject = sheaf.subject.objects[0];
        var session = sheaf.session.objects[0];
        env._.amap(_.keys(socket.controllers), function(controllerName, cb){
          var controller = socket.controllers[controllerName];
          controller.addSubject(subject, session, function(err, result){
            if(err) throw err;
            if(result===false){
              delete socket.controllers[controllerName];
              return cb(null, null);
            }
            if(!sheaf.controllers[controllerName]) {
              sheaf.controllers[controllerName] = [socket];
              self.trigger("bind:controller", controllerName, controller, sheaf);
            }
            else sheaf.controllers[controllerName].push(socket);
            cb(null, [controller.id.name, controller.id.methods]);

            // TODO Find way to drop the listener on disconnect
            socket.on(controllerName, function(data, cb){
              controller.handleMessage(data, subject, cb);
            });

          });
        }, function(err, results){
          var initData = {};
          for(var i=0;i<results.length;i++){
            if(results[i]===null) continue;
            initData[results[i][0]] = results[i][1];
          }
          socket.initialize(null, initData);
          socket.once("disconnect", function(){self.trigger("disconnect", socket, subject, sheaf);});
        });
      },

      "setup:all": function(sheaf){
        sheaf.controllers = {};
        for(var i=0;i<sheaf.socket.objects.length;i++){
          this.trigger("setup:socket", sheaf.socket.objects[i], sheaf);
        }
      },


      // This event is triggered only once for every controller
      // If new socket connection is established, this event will be called only for
      // controllers, that are not active for other sockets
      // For example - different apps can handle different sets of controllers
      "bind:controller": function(name, controller, sheaf){
        var subject = sheaf.subject.objects[0];
        controller.createSocket(subject, function(data){
          if(sheaf.controllers[name]){
            sheaf.controllers[name].forEach(function(socket){
              socket.emit(name, data);
            });
          }
          else{
            controller.removeSubject(sheaf.subject.objects[0]);
          }
        });
        var session = sheaf.session;
        var sessionData = session.objects[0].id.session.id;
        controller.createSession(subject, sessionData, function(action, data, cb){
          // action should be 'save' or 'destroy, session method

        });
      },


      //Handle single socket disconnection
      "disconnect": function(socket, subject, sheaf){
        socket.__drop();
        var sockets = sheaf.socket.objects;
        for(var i=0;i<sockets.length;i++){
          if(sockets[i]===socket){
            sockets.splice(i,1);
            break;
          }
        }
        for(var key in sheaf.controllers){
          var controllerSockets = sheaf.controllers[key];
          for(var j=0;j<controllerSockets.length;j++){
            if(controllerSockets[j]===socket){
              controllerSockets.splice(j,1);
            }
          }
          if(controllerSockets.length===0){
            socket.controllers[key].removeSubject(subject);
            socket.controllers[key].off(sheaf.id);
            delete sheaf.controllers[key];
          }
        }
        if(sockets.length===0){
          this.remove(sheaf.id);
        }
      },

      "remove": function(sheaf){
        sheaf.session.objects[0].__drop();
      }

    }
  });

  function checkState(obj, sheaf){
    if(sheaf.isReady){
      if(obj.id) {
        return this.trigger("setup:"+obj.id.type, obj, sheaf);
      }
    }
    else if(sheaf.subject.objects.length===1 && sheaf.session.objects.length===1) {
      sheaf.isReady = true;
      this.trigger("setup:all", sheaf);
    }
  }

  function handleSocket(socket){
    var data = socket.id;
    socket.controllers = _.pick(controllers, socket.id.controllers);
    Pigeonry.addObject("socket", socket, data.session);
  }

  function handleSession(session){
    var sheaf = Pigeonry.get(session.id.session._id);
    var sessionData = session.id.session;
    // We need only one subject
    if(!sheaf || sheaf.session.objects.length===0){
      Pigeonry.addObject("subject", sessionData.subject);
    }
    // { 
    //   cookie: {
    //     originalMaxAge: null,
    //     expires:        null,
    //     secure:         null,
    //     httpOnly:       true,
    //     domain:         null,
    //     path:           '/' 
    //   },
    //   id:   "ksjdhfkh fksj hdfkjshdfkjshfkj " ???
    //   subject: { 
    //       _id:         '54480e1d40d806000d2dd3dd',
    //       username:    'anonymous_349246099963061',
    //       email:       'anonymous_349246099963061',
    //       created:     '2014-10-22T20:05:49.246Z' 
    //   } 
    // }

    var sheaf = Pigeonry.get(sessionData.subject._id);
    if(sheaf){
      var sessions = sheaf.session, exists = false;
      for(var i=0;i<sessions.objects.length;i++){
        var obj_sess = sessions.objects[i];
        if(obj_sess.id.session.id === sessionData.id){
          exists = true; break;
        }
      }
      if(!exists){
        Pigeonry.addObject("session", session, sessionData);
      }
      else session.__drop(); // We do not need the same session twice
    }
    //var sessionID = sessionData.id;
    else{
      Pigeonry.addObject("session", session, sessionData);
    }
  }

  function handleNewPigeon(clone){
    var data = clone.id;
    if(data.type==="socket")  handleSocket(clone);
    if(data.type==="session") handleSession(clone);
  }

  // var pigeon_getters   = {};
  var pigeon_factories = {};
  function createPigeonFactory(remote_addr, layer, cb){
    var remote_id = remote_addr.slice(-1).pop();
    var factory = pigeon_factories[remote_id] = new CloneRPC({
      sendData: function(data)  { layer.send(remote_addr.slice(), data); },
      getData:  function(fn){ /*pigeon_getters[remote_id] = fn;*/ },
      onClone: handleNewPigeon
    });
    factory.build(remote_id, {}, function(){

    });
    cb(null);
  }

  function destroyPigeonFactory(address){
    delete pigeon_factories[address];
  }

  function handlePigeonMessage(data, cb, remote_addr){
    var layer = this;
    if(data.initialize===true) createPigeonFactory(remote_addr, layer, cb);
    else if(data.destroy===true){
      destroyPigeonFactory(data.address);
    }
    else{
      var remote_id = remote_addr.slice(-1).pop();
      var factory = pigeon_factories[remote_id];
      if(!factory) return cb && cb("Can't find factory: " + remote_id);
      factory.onMessage(data);
    }
  }














  function handleController(controller){
    if(controllers[controller.id.name]){
      controller.__drop();
      throw new Error("Controller "+controller.id.name+" exists");
    }
    controllers[controller.id.name] = controller;
    controller.build(controller.id, {}, function(){});
  }

  var controllers           = {};
  var factories             = {};

  function createControllerFactory(remote_addr, layer, cb){
    var remote_id = remote_addr.slice(-1).pop();
    var ControllerFactory = factories[remote_id] = new CloneRPC({
      sendData: function(data){ layer.send(remote_addr.slice(), data); },
      onClone: handleController
    });
    ControllerFactory.build(remote_id, {}, function(){

    });
    cb(null);
  }

  function destroyControllerFactory(){
    throw new Error("TODO");
  }

  function handleControllerMessage(data, cb, remote_addr){
    var layer = this;
    if(data.initialize===true)   createControllerFactory(remote_addr, layer, cb);
    else if(data.destroy===true) destroyControllerFactory(data.address);
    else{
      var factory_id = remote_addr.slice(-1).pop();
      var factory = factories[factory_id];
      if(!factory) return cb && cb("Can't find factory: " + factory_id);
      factory.onMessage(data);
    }
  }





  var pigeonryAddresator = new Addresator({
    id: "pigeonry",
    layers: true,
    onError:   function(err, cb){ env.log("pigeonryAddresator error:", err); }
  });

  pigeonryAddresator.layer("pigeon",     handlePigeonMessage);
  pigeonryAddresator.layer("controller", handleControllerMessage);

  core.branch("pigeonry", function(addr, data, cb){ pigeonryAddresator.route(addr, data, cb); });
  pigeonryAddresator.branch(env.config.hostname, function(addr, data, cb){ core.route(addr, data, cb); });

  


}