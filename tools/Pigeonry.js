
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
        if(!session.user._id) console.error(new Error("We need subject id here!!!!").stack);
        return session.user._id;
      }
    },
    session: {
      methods:["save", "destroy"],
      add: function(session, sessionData){
        if(!sessionData.user._id) console.error(new Error("We need proper session id here!!!!").stack);
        return sessionData.user._id;
      }
    },
    subject: {
      methods:[],
      add: function(subject){
        return subject._id;
      }
    }
  },
  {
    // TODO - make it to trigger change event
    ready: function(sheaf){
      if(sheaf.socket.objects.length>0 && sheaf.session.objects.length>0) return true;
    }
  });

  Pigeonry.on("ready", function(sheaf){
    var initData = {};
    throw new Error("pigeon ready, continue from here !!!!");
    // Send initialize(null, initData)
  });

  function handleSocket(socket){
    var data = socket.id;
    Pigeonry.addObject("socket", socket, data.session);
  }

  function handleSession(session){
    var sheaf = Pigeonry.get(session.id.session._id);
    if(!sheaf || sheaf.session.objects.length===0){
      Pigeonry.addObject("session", session, session.id.session);        
    }
    else{
      session.__drop();
    }
  }

  function handleNewPigeon(clone){
    var data = clone.id;
    console.log("----------", data.type);
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
    //console.log("++++ controller clone", controller.id.name);
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
    //console.log("++++ building controller factory", remote_id);
    var ControllerFactory = factories[remote_id] = new CloneRPC({
      sendData: function(data){ layer.send(remote_addr.slice(), data); },
      // getData:  function(){},
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
    //console.log("++++ controller message", remote_addr.slice(-1)[0], JSON.stringify(data));
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
    onError:   function(err, cb){ console.log("pigeonryAddresator error:", err); }
  });

  pigeonryAddresator.layer("pigeon",     handlePigeonMessage);
  pigeonryAddresator.layer("controller", handleControllerMessage);

  core.branch("pigeonry", function(addr, data, cb){ pigeonryAddresator.route(addr, data, cb); });
  pigeonryAddresator.branch("core", function(addr, data, cb){ core.route(addr, data, cb); });

  


}