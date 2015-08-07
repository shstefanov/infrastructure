var _            = require("underscore");
var cookie       = require("cookie");
var helpers      = require("./helpers");
var EventedClass = require("../lib/EventedClass");

var WebsocketApp = EventedClass.extend("WebsocketApp", {

  constructor: function(env){
    var self = this, config = env.config, io = env.engines.io;

    var options = _.extend( {}, config.websocket, {
      path: this.path,
      // origins: function(req_origin, cb){
      //   console.log("origin: ", req_origin );
      //   cb( null, true );
        
      // }
    });

    console.log(options);

    var sio = this.sio = io(options);

    sio.checkRequest = function(req, cb){
      var cookies = cookie.parse( req.headers.cookie );
      self.trigger( "request", req, cookies, cb );
    };

    this
      .on( "request",  this.handleRequest, this )
      .on( "session",  this.handleSocket,  this )
      .on( "error",    this.handleError,   this )
      .on( "socket",   this.handleSocket,  this );


    // sio._origins = []

    sio.listen(this.port);

    var handleConnection = function(socket){
      // search for socket.request.session
      console.log( "socket: ", socket.request.customProp );
      // ?? cleanup socket - try to delete some properties
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

  handleRequest: helpers.chain([
    
    function( req, cookies, cb ){
      // console.log("cookies: ",     cookies     );
      // console.log("url: ",         req.url     );
      // console.log("headers: ",     req.headers );
      // console.log("query: ",       req._query  );
      // console.log("token: ",       req._query[this.tokenParam]  );
      // console.log("sessionId: ",   this.tokens[req._query[this.tokenParam]]  );
      cb(null, req, cookies, this.tokens[req._query[this.tokenParam]], req._query[this.tokenParam]);
    },

    function( req, cookies, sessionId, token, cb ){
      var session = new this.env.classes.Models.Session({ _id: sessionId });
      session.fetch(success: function(){
        cb(null, session), error: cb 
      });
    },

  ]),



  // function(req, cb){
  //   // req.headers ...
  //   // parse req.headers.cookie
  //   // find session
  //   // set req.session = new Session(...)
  //   req.session = { id: _.uniqueId("session") };
  //   console.log("handleRequest", req.headers);
  //   cb(null, true)
  // },

  handleSocket: function(socket){
    // socket.request.session
  },

  handleSession: function(session){

  }

});

module.exports = WebsocketApp;
