
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
        if(!session._id) console.error(new Error("We need subject id here!!!!").stack);
        return session._id;
      }
    },
    session: {
      methods:["save", "destroy"],
      add: function(session){
        return session._id;
      }
    }
  },
  {
    ready: function(sheaf){
      if(sheaf.socket.objects.length>0 && sheaf.session.objects.lengh>0) return true;
    }
  });

  Pigeonry.on("ready", function(sheaf){
    var initData = {};
    console.log("Pigeon ready !!!");
    // Send initialize(null, initData)
  });

  function handleSocket(socket){
    var data = socket.id;
    Pigeonry.addObject("socket", socket, data.session);
  }

  function handleSession(session){
    var sheaf = Pigeonry.get(session.id.session._id);
    if(!sheaf || sheaf.session.objects.length===0){
      Pigeonry.addObject("session", session);        
    }
    else{
      session.__drop();
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
    // delete pigeon_getters[address];
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
  var controllers_getters   = {};

  function createControllerFactory(remote_addr, layer, cb){
    var remote_id = remote_addr.slice(-1).pop();
    var ControllerFactory = new CloneRPC({
      sendData: function(data){ layer.send(remote_addr.slice(), data); },
      getData:  function(fn){ c/*ontrollers_getters[remote_id] = fn;*/ },
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
      var remote_id = remote_addr.slice(-1).pop();
      var factory = controllers_getters[remote_id];
      if(!factory) return cb && cb("Can't find factory: " + remote_id);
      factory.onMessage(data);
    }
  }

  var pigeonryAddresator = new Addresator({
    id: "pigeonry",
    layers: true,
    // onMessage: function(data, cb, remote_addr){
    //   switch(data.type){
    //     case "pigeon":
    //       handlePigeonMessage(data, cb, remote_addr);
    //       break;

    //     case "controller":
    //       handleControllerMessage(data, cb, remote_addr);
    //       break;
    //   }
    // },
    onError:   function(err, cb){
      console.log("pigeonryAddresator error:", err);
    }
  });

  pigeonryAddresator.layer("pigeon",     handlePigeonMessage);
  pigeonryAddresator.layer("controller", handleControllerMessage);

  





  core.branch("pigeonry", function(addr, data, cb){
    pigeonryAddresator.route(addr, data, cb);
  });
  pigeonryAddresator.branch("core", function(addr, data, cb){
    core.route(addr, data, cb);
  });

  


}