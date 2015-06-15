
module.exports = function(cb){

  var env    = this;
  var config = env.config;
  if(!config.websocket) return cb();
  var _      = require("underscore");

  this.socketConnection = function(err, socket, session){
    if(err){
      socket  && socket.disconnect();
      session && session.destroy();
      return env.call("log.error", ["websocket", err]);
    }

    if(!session.subjectId){
      socket  && socket.disconnect();
      session && session.destroy();
      return env.call("log.error", ["websocket", "Can't find subjectId"]);
    }

    if(!session.appToken){
      socket  && socket.disconnect();
      session && session.destroy();
      return env.call("log.error", ["websocket", "Can't find appToken"]);
    }

    if(config.websocket.init_idle_timeout){
      var t = setTimeout(function(){
        socket.disconnect();
      }, config.websocket.init_idle_timeout || 1000*60);
      socket.on("init", function(data, cb){
        clearTimeout(t);
        var args = [socket.id, session];
        env.call(config.websocket.handle_connection_target || "controllers.subjectsController.connect", args, function(err){
          if(err) return env.call("log.error", ["websocket", err]);
        });
      });
    }
    else{
      socket.on("init", function(data, cb){
        var args = [socket.id, session];
        env.call(config.websocket.handle_connection_target || "controllers.subjectsController.connect", args, function(err){
          if(err) return env.call("log.error", ["websocket", err]);
        });
      });
    }

    socket.on("disconnect", function(){
      var args = [socket.id, session];
      env.call(config.websocket.handle_disconnect_target || "controllers.subjectsController.disconnect", args, function(err){
        if(err) return env.call("log.error", ["websocket", err]);
      });
    });


  };

  cb&&cb(null);
};
