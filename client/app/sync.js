
//Overriding original Backbone.sync method to work with socket.io and dbService
Backbone.sync = function(method, model, options){
  var queryId = _.uniqueId("sync");

  var actions = {
    read: model.id? "findOne" : "find",
    create: "create",
    update: "update",
    'delete': 'remove'
  }

  socket.on(queryId, function(data){
    if(data.error){model.trigger("error", err); return;}
    model.set(data.body);
    socket.removeListener(queryId);
  }).emit("db",{
    action: actions[method],
    body:model.attributes,
    queryId: queryId
  });
  
};




