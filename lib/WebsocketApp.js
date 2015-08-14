var _            = require("underscore");
var helpers      = require("./helpers");
var EventedClass = require("../lib/EventedClass");

var WebsocketApp = EventedClass.extend("WebsocketApp", {

  constructor: function(env){
    var self = this, config = env.config, io = env.engines.io;

    var options = _.extend( {}, config.websocket, {
      path: this.path,
    });

    var sio = this.sio = io(options);

    env.stops.push(function(cb){ sio.close(); cb(); });

    sio.checkRequest = function(req, cb){ self.trigger( "request", req, cb ); };

    this
      .on( "request",  this.handleRequest, this )
      .on( "session",  this.handleSocket,  this )
      .on( "error",    this.handleError,   this )
      .on( "socket",   this.handleSocket,  this );

    sio.listen(this.port);

    var handleConnection = function(socket){ self.trigger( "socket", socket, socket.request.session ); };
    sio.on( "connection", handleConnection );

    EventedClass.apply( this, arguments );
  },

  // Generating one-time token
  generateAppToken: function(){
    return _.uniqueId(this.name);
  },

  // When request hits page, it will call this 
  // function to create token for websocket connection
  // and to get websocket configurtion for connection 
  // to this websocket application
  getWebsocketConfig: function(sessionId, cb){
    var settings = _.pick(this, ["protocol", "path", "transports", "host", "port", "name"]);
    var token = this.generateAppToken();
    this.tokens[token] = sessionId;
    settings.query = this.tokenParam+"="+token;
    cb(null, settings);
  },

  bindSocketEvents: function(socket){
    var self = this;
    socket.listeners = [];
    var bindSocket = this.bindSocket;
    if(!bindSocket) socket.emit("init", []);
    else{
      for(var event in bindSocket){
        var handler = bindSocket[event];
        if(_.isString(handler)){
          socket.on(event, _.bind(this.env.i.do, this.env.i, handler));
        }
        else if(_.isFunction(handler)){
          switch (handler.name){
            case "do_listener":
              this.env.i.do(event, (function(hndl){
                socket.listeners.push(do_listener);
                function do_listener(){hndl.appply(self, arguments)}; return do_listener;
              })(handler));
              break;
            case "do_stream":
              this.env.i.do(event, (function(hndl){
                function do_stream(){hndl.appply(self, arguments)}; return do_stream;
              })(handler));
            default:
              this.env.i.do(event, _.bind(handler, this));
              break;
          }
          socket.on("event", _.bind(this.env.i.do, this.env.i, handler));
        }
      }      
    }

    var controllers = this.controllers;
    if(!controllers) socket.emit("init", [])
  },

  // Default handleRequest will accept all requests
  handleRequest: function(req, cb){ cb(null, true) },


  handleSocket: function(socket){
    // socket.request.session
  },

  handleSession: function(session){

  }

});

module.exports = WebsocketApp;
