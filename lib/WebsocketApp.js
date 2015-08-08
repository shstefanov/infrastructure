var _            = require("underscore");
var cookie       = require("cookie");
var helpers      = require("./helpers");
var EventedClass = require("../lib/EventedClass");

var WebsocketApp = EventedClass.extend("WebsocketApp", {

  constructor: function(env){
    var self = this, config = env.config, io = env.engines.io;

    var options = _.extend( {}, config.websocket, {
      path: this.path,
    });

    console.log(options);

    var sio = this.sio = io(options);

    sio.checkRequest = function(req, cb){
      self.trigger( "request", req, cb );
    };

    this
      .on( "request",  this.handleRequest, this )
      .on( "session",  this.handleSocket,  this )
      .on( "error",    this.handleError,   this )
      .on( "socket",   this.handleSocket,  this );

    sio.listen(this.port);

    var handleConnection = function(socket){
      console.log( "socket: ", socket.request.customProp );
    };

    sio.on( "connection", handleConnection );
    // io.listen(this.port);

    // function handleConnection(socket){
    //   console.log("handleConnection", arguments.length);
    // }


    EventedClass.apply( this, arguments );

    // var io = require('socket.io')();
    // io.on('connection', function(socket){});
    // io.listen(3000);
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
