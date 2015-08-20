var _            = require("underscore");
var helpers      = require("./helpers");
var EventedClass = require("../lib/EventedClass");

var noop = function(){};

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
  chainTail: function(socket, data, result, cb){ cb(null, result );        },
  parseSocketEvents: function(){
    var events = this.listenSocket;
    if(!events) { this.__parsedSocketEvents = {}; return; }
    var self = this;
    this.__parsedSocketEvents = _.mapObject(events, function(handler, event_name){
      return self.createChain([
        self.chainLead,
        self.parseHandler(handler),
        self.chainTail,
      ], true );
    });
  },

  parseHandler: function(handler, path){
    if(_.isFunction(handler))    return handler;
    else if(_.isString(handler)) return this.createDoCaller(handler, path);
    else if(_.isArray(handler))  return this.createChain(handler);
    else if(_.isObject(handler)) return this.createConcurent(handler);
  },


  createChain: function(handlers, initial){
    var self = this;
    var fns = handlers.slice(), last;
    if(initial) last = fns.pop();

    return helpers.chain(fns.map(function(hndl, index){
      var parsed = self.parseHandler(hndl);
      return function(socket, data, result, cb){
        parsed.call(socket, socket, data, result, function(err){
          if(err) return cb(err);
          cb(null, socket, data, result);
        });
      }
    }).concat( initial ? [last] : [] ) );
  },

  defaultArgGetter: function(){return [];},
  defaultDataPatcher: function(data, result){_.extend(result, data);},
  createDoCaller: function(str, path){
    var self          = this;
    var parts         = str.split("|").map(function(s){return s.trim();});
    if(path) parts[2] = path;
    var argGetter     = parts[1]? new Function( "socket, data, result, _", "return [" + parts[1] + "];" ) : this.defaultArgGetter;
    var dataPatcher   = parts[2]? function(data, result){ helpers.patch(result, parts[2], data); }        : this.defaultDataPatcher;
    return function(socket, data, result, cb){
      var do_args = argGetter(socket, data, result, _);
      self.env.i.do.apply(self.env.i, [parts[0]].concat(do_args.concat([function(err, do_result){
        if(err) return cb(err);
        dataPatcher(do_result, result);
        cb( null, socket, data, result );
      }])));
    };
  },

  createConcurent: function(handlers, initial){
    var self   = this;
    var parsed = _.mapObject(handlers, function(handler, path){
      return self.parseHandler( handler, path );
    });
    var concurent = helpers.amapCompose( parsed, null );
    return function(socket, data, result, cb){
      concurent.call(this, null, function(handler, done){
        handler.call(this, socket, data, result, function(err){done(err);} );
      }, cb, this );
    };

  },

  bindSocketEvents: function(socket){
    var self = this;
    socket.listeners = [];
    var bindSocket = this.__parsedSocketEvents;
    var init = {methods: []};

    this.defaultHandler = this.defaultHandler || function(err, result){
      if(err) self.i.do( "log.error", "WebsocketApp default error handler", err );
    };

    for(var event in bindSocket){ 
      var handler = bindSocket[event];
      init.methods.push(event);

      (function(event, handler){
        socket.on(event, function(){
          var args = Array.prototype.slice.call(arguments);
          var parsed_args = self.validateEventData(args);
          if(!parsed_args) return;
          handler.apply(socket, parsed_args);
        });
      })(event, handler);

    }
    socket.emit("init", init );

  },

  validateEventData: function(args){

    if(args.length === 0){
      return [null, this.defaultHandler];
    }

    if(args.length === 1 && _.isFunction(args[0])){
      args.unshift(null);
      return args;
    }

    var cb = args.filter(function(arg){ return typeof arg === "function" });
    if(cb.length > 2){
      _.invoke(cb, "call", global, "Unexpected error");
      return false;
    }
    if(cb.length === 0) args.push(this.defaultHandler);
    return args;
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
