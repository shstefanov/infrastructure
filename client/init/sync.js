Backbone.sync = function(method, model, options){
  if(method=="delete"){options.success(model); return;}
  var methods={create:"new",read:"get",update:"set","delete":"destroy"};
  var store = app.services[model.name];
    store[methods[method]](model.toJSON(), function(err, data){
      if(err) {model.trigger("error", err); options.error(err); return;}
      if(method == "create" || method == "update"){model.set(data);model.trigger("save"); return;}
      else{model.set(data); options.success(data); return;}
    });  
}
