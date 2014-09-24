





// Only called in clusterMode:true

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
    // Send initialize(null, initData)
  });


  function handleSocket(socket){
    var data = socket.id;

    // Check if sheaf exists
    var sheaf = Pigeonry.get(data.session._id);
    if(sheaf){

    }
    else{
      pigeonryAddresator.send(["core", "controller_0"], {
        type: "getControllers",
        body: data.controllers || []
      }, function(err, controllers){
        if(err) throw err;
        console.log("controllers:::", controllers);
        socket.controllers = _.keys(controllers);
        socket.initData = controllers;
        Pigeonry.addObject("socket", socket, data.session);
      });
    }

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


  var pigeon_getters   = {};
  var pigeon_factories = {};
  function createPigeonFactory(remote_addr, cb){
    var remote_id = remote_addr.slice(-1).pop();
    pigeon_factories[remote_id] = new CloneRPC({
      sendData: function(data)  {
        pigeonryAddresator.send(remote_addr.slice(), {type:"pigeon", body: data});
      },
      getData:  function(fn){ pigeon_getters[remote_id] = fn; },
      onClone: handleNewPigeon
    });
    pigeon_factories[remote_id].build(remote_id, {}, function(){

    });
    cb(null);
    // cb(null);
  }

  function destroyPigeonFactory(address){
    delete pigeon_getters[address];
    delete pigeon_factories[address];
  }

  function handlePigeonMessage(data, cb, remote_addr){
    if(data.initialize===true) createPigeonFactory(remote_addr, cb);
    else if(data.destroy===true){
      destroyPigeonFactory(data.address);
    }
    else{
      var remote_id = remote_addr.slice(-1).pop();
      var getter = pigeon_getters[remote_id];
      if(!getter) return cb && cb("Can't find facory: " + remote_id);
      getter(data.body);
    }
  }














  function handleController(controller){
    controller.build(controller.id, {}, function(){
      console.log("Controller built   ;;;)))", controller.id, controller);
    })
  }

  var controllers           = {};
  var controllers_getters   = {};

  function createControllerFactory(remote_addr, cb){
    var remote_id = remote_addr.slice(-1).pop();
    var ControllerFactory = new CloneRPC({
      sendData: function(data){
        pigeonryAddresator.send(remote_addr.slice(), {type:"controller", body: data});
      },
      getData:  function(fn){ controllers_getters[remote_id] = fn; },
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
    if(data.initialize===true) createControllerFactory(remote_addr, cb);
    else if(data.destroy===true){
      destroyControllerFactory(data.address);
    }
    else{
      var remote_id = remote_addr.slice(-1).pop();
      var getter = controllers_getters[remote_id];
      if(!getter) return cb && cb("Can't find facory: " + remote_id);
      getter(data.body);
    }
  }

  var pigeonryAddresator = new Addresator({
    id: "pigeonry",
    onMessage: function(data, cb, remote_addr){
      switch(data.type){
        case "pigeon":
          handlePigeonMessage(data, cb, remote_addr);
          break;

        case "controller":
          handleControllerMessage(data, cb, remote_addr);
          break;
      }
    },
    onError:   function(err, cb){
      console.log("pigeonryAddresator error:", err);
    }
  });

  core.branch("pigeonry", function(addr, data, cb){
    pigeonryAddresator.route(addr, data, cb);
  });
  pigeonryAddresator.branch("core", function(addr, data, cb){
    core.route(addr, data, cb);
  });

  


}