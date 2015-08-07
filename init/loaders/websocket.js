module.exports = function(cb){
  var env    = this;
  env.structureLoader("websocket", function setupWebsocket(name, WebsocketApp){
    WebsocketApp.prototype.env  = env;
    if(!WebsocketApp.prototype.path) Page.prototype.path = "/"+name;
    return new WebsocketApp(env);
  }, cb );

};
