var _ = require("underscore");

var internal = {
  emit: true,
  service_index:true,
  initialize: true,
  auth: true,

  app:true,
  socket:true,
  session:true
};

module.exports = function(err, socket, session, cb){
  if(err) throw err;

  var app = this;

    var services = app.services;

    var userServicesNames = session.services;
    var userServices = {};
    
    userServicesNames.forEach(function(serviceName){
      if(!services[serviceName]) return;

      userServices[serviceName] = {
        name:serviceName,
        app:app,
        socket:socket,
        session:session,
        error: function(data, err){
          data.meta="error";
          data.body=err;
          this.socket.emit("service", data);
          if(this.app.error)
            app.error(err);
        },
        success:function(data, res){
          data.meta="success";
          data.body=res;
          this.socket.emit("service", data);
        },
        emit: function(data){
          data.service = this.name;
          this.socket.emit("service", data);
        },
        next: function(data){
          if(typeof services[this.name][data.action] == "function")
            services[this.name][data.action].call(this, data);
        },
        service_index: function(){
          var api = [];
          for (method in services[this.name]){
            api.push(method); 
          }
          this.emit({
            action: "service_index",
            body: api
          });
        }
      };

      if(services[serviceName].initialize && typeof services[serviceName].initialize === "function"){
        services[data.service].initialize.call(userServices[serviceName]);
      }

    });

    socket.on("service", function(data){

      if(data.action == "service_index" && userServices[data.service]){
        userServices[data.service].service_index()
      }
      else if(userServices[data.service] && typeof services[data.service][data.action] == "function"){
        if(services[data.service].auth && typeof services[data.service].auth == "function"){
          
          services[data.service].auth.call(userServices[data.service], data);
        }

        else{
          userServices[data.service].next.call(userServices[data.service], data);
        }
      }

    });

  socket.emit("ready", _.pluck(userServices, "name"));
  cb();
  
  return this;
};
