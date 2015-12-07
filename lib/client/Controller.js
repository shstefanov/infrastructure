var _ = require("underscore");
var EventedClass = require("../EventedClass.js");

module.exports = EventedClass.extend("Controller", {

  bindRoutes: function(app){
    for(var key in this.routes){
      var handlerName = this.routes[key];
      if(Array.isArray(handlerName)){
        for(var i=0;i<handlerName.length;i++){
          if(_.isFunction(this[handlerName[i]])){
            app.router.on("route:"+key, this[handlerName[i]], this);
          }
        }
      }
      else{
        if(_.isFunction(this[handlerName])){
          app.router.on("route:"+key, this[handlerName], this);
        }
      }
    }
  }
});
