





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
    pigeonryAddresator.send(["core", "controller_0"], {
      type: "getControllers",
      body: data.controllers || []
    }, function(err, controllers){
      if(err) throw err;
      socket.controllers = _.keys(controllers);
      socket.initData = controllers;
      Pigeonry.addObject("socket", socket, data.session);
    })
  }

  function handleSession(session){
    var sheaf = Pigeonry.get(session.id.session._id);
    if(!sheaf || sheaf.session.objects.length===0){
      Pigeonry.addObject("session", clone);        
    }
    else{
      clone.__drop();
    }
  }

  function handlePigeon(clone){
    var data = clone.id;
    if(data.type==="socket") handleSocket(clone);
    
    if(data.type==="session"){
      console.log("we have session clone here", clone.id);
      var sheaf = Pigeonry.get(clone.id.session._id);
      if(sheaf.session.objects.length===0){
        Pigeonry.addObject("session", clone);        
      }
      else{
        clone.__drop();
      }
    }
  }


  var getters   = {};
  var factories = {};
  function createPigeonFactory(remote_addr, cb){
    var remote_id = remote_addr.slice(-1).pop();
    factories[remote_id] = new CloneRPC({
      sendData: function(data)  {
        pigeonryAddresator.send(remote_addr.slice(), {type:"pigeon", body: data});
      },
      getData:  function(fn){ getters[remote_id] = function(data){
        fn(data);
      }; },
      onClone: handlePigeon
    });
    factories[remote_id].build(remote_id, {}, function(){

    });
    cb(null);
    // cb(null);
  }

  function destroyPigeonFactory(address){
    delete getters[address];
    delete factories[address];
  }

  function handlePigeonMessage(data, cb, remote_addr){
    if(data.initialize===true) createPigeonFactory(remote_addr, cb);
    else if(data.destroy===true){
      destroyPigeonFactory(data.address);
    }
    else{
      var remote_id = remote_addr.slice(-1).pop();
      var getter = getters[remote_id];
      if(!getter) return cb && cb("Can't find facory: " + remote_id);
      getter(data.body);
    }
  }

  function handleController(data, cb, remote_addr){

  }

  var pigeonryAddresator = new Addresator({
    id: "pigeonry",
    onMessage: function(data, cb, remote_addr){
      switch(data.type){
        case "pigeon":
          handlePigeonMessage(data, cb, remote_addr);
          break;

        case "controller":
          handleController(data, cb, remote_addr);
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