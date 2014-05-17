


module.exports = App.EventedClass.extend("Controller", {
  
  constructor: function(name, methods){
    var self = this
    this.name = name;
    for(var i = 0;i<methods.length;i++){
      this.createMethod(methods[i]);
    }

    var self = this;
    socket.on(name, function(data){
      self.trigger(data.action, data.body);
    });
  },

  createMethod: function(methodName){
    var self = this;
    this[methodName] = function(data, cb, ctx){ 
      socket.emit(self.name, {
        action: methodName,
        body:   data
      }, cb?(ctx?_.bind(cb,ctx):cb):undefined);
    };
  },

  emit: function(event, data){
    socket.emit(this.namespace, {
      controller: this.name,
      event: event,
      body: data
    });
  },

});