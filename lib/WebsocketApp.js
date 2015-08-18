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

    this.parseSocketEvents();

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

  chainLead: function(data, cb){                 cb(null, this, data, {} ) },
  chainTail: function(socket, data, result, cb){ cb(null, result )         },
  parseSocketEvents: function(){
    var events = this.listenSocket;
    if(!events) { this.__parsedSocketEvents = {}; return; }
    var self = this;
    this.__parsedSocketEvents = _.mapObject(events, function(handler, event_name){
      return self.createChain([
        self.chainLead,
        self.parseHandler(handler),
        self.chainTail,
      ]);
    });
  },

  parseHandler: function(handler){
    if(_.isFunction(handler))    return handler;
    else if(_.isString(handler)) return this.createDoCaller(handler);
    else if(_.isArray(handler))  return this.createChain(handler);
    else if(_.isObject(handler)) return this.createConcurent(handler);
  },


  createChain: function(handlers){
    var self = this;
    return helpers.chain(handlers.map(function(hndl){
      var parsed = self.parseHandler(hndl);
      return function(socket, data, result, cb){
        hndl.call(socket, socket, data, result, function(err){
          if(err) return cb(err);
          cb(null, socket, data, result);
        });
      }
    }));
  },

  defaultArgGetter: function(){return [];},
  defaultDataPatcher: function(data, result){_.extend(result, data);},
  createDoCaller: function(str){
    var self        = this;
    var parts       = str.split("|").map(function(s){return s.trim();});
    var argGetter   = parts[1]? new Function( "socket, data, result, _", "return [" + parts[1] + "];" ) : this.defaultArgGetter;
    var dataPatcher = parts[2]? function(data, result){ helpers.patch(result, parts[2], data); }        : this.defaultDataPatcher;
    return function(socket, data, result, cb){
      self.env.i.do.apply(self.env.i, [parts[0]].concat(argGetter(socket, data, result, _).concat([function(err, result){
        if(err) return cb(err);
        dataPatcher(data, result);
        cb( null, socket, data, result );
      }])));
    };
  },

  createConcurent: function(handlers){

  },

  bindSocketEvents: function(socket){
    var self = this;
    socket.listeners = [];
    var bindSocket = this.__parsedSocketEvents;
    var init = [];
    for(var event in bindSocket){ 
      var handler = bindSocket[event];
      init.push(event);
      socket.on(event, handler);
    }
    socket.emit("init", init );

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
