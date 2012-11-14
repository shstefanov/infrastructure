
var app, config, models;

var methods = {
  //with pattern
  findOne:"findOne",
  find:"find",
  update:"update",
  remove:"remove",

  create:function(model, data){
    var request = data;
    var instance = new models[model](data.body)
    .save(function(err, result){
      var response = request;
      response.body = result;
      if(err){
        response.error = err;
        socket.emit("db",response);
        return;
      }
      socket.emit("db",response);
    });
  }

};

//Called in socket.js (dbServiceInitializer)
module.exports = function(socket, _app, _config, _models){
  app = _app, config = _config, models = _models;

  socket.on("db", function(data){
    var model = data.model;
    var action = data.action;
    var body = data.body;
    var method = methods[action];
    
    if(!models[model])    {socket.emit("db", {error:  "Can't find model: " +  model }); return;}
    if(!methods[method])  {socket.emit("db", {error:  "Invalid db action: "+  action}); return;}

    if(typeof method === "string"){
      models[method](body, function(err, result){ //body is pattern
        soclet.emit("db", {
          model: model,
          body:result
        });
      });
    }
    if(typeof method === "function"){
      method(model, data);
    }
    
  });

};
