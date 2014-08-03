
var emptyFunction = function(){};

module.exports = App.EventedClass.extend("Controller", {
  
  constructor: function(name, methods){
    var self = this
    this.name = name;
    for(var i = 0;i<methods.length;i++) this.createMethod(methods[i]);

    var self = this;
    socket.on(name, function(data){
      self.trigger(data.action, data.body);
    });
    socket.on("init", function(initData){
      for(var i = 0;i<methods.length;i++) this.hideMethod(methods[i]);
      if(initData[self.name] && _.isArray(initData[self.name]) && _.every(initData[self.name], _.isString)){
        methods = initData[self.name];
        for(var i = 0;i<methods.length;i++) this.createMethod(methods[i]);
      }
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

  hideMethod: function(methodName){
    this[methodName] = emptyFunction;
  },

  emit: function(event, data){
    socket.emit(this.name, {
      controller: this.name,
      event: event,
      body: data
    });
  },

});