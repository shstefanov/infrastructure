var _            = require("underscore");
var cookie       = require("cookie");
var helpers      = require("./helpers");
var EventedClass = require("../lib/EventedClass");

var noop = function(){};

var WebsocketApp = EventedClass.extend("WebsocketApp", {

  constructor: function(env){
    var self    = this, 
        config  = env.config, 
        io      = env.engines.io,
        options = _.extend({}, config.websocket, { path: this.options.path }),
        sio     = this.sio = io(options);

    env.stops.push(function(cb){ sio.close(); cb(); });

    this.tokens   = {};

    this.sessions = new this.SessionsCollection();
    this.sessions.indexBy("cookie", function(session){ return session.cookie; });

    sio.checkRequest = function(req, cb){ self.trigger( "request", req, cb ); };

    this
      .on( "request",  this.handleRequest, this )
      .on( "session",  this.handleSocket,  this )
      .on( "error",    this.handleError,   this )
      .on( "socket",   this.handleSocket,  this );

    sio.listen(this.options.port);

    var handleConnection = function(socket){ self.trigger( "socket", socket, socket.request.session ); };
    sio.on( "connection", handleConnection );

    this.parseSocketEvents();

    EventedClass.apply( this, arguments );

    env.i.do("log.sys", "websocket server", this.options.name+": ["+this.options.protocol+this.options.host+":"+this.options.port+"]")
  },

  // Generating one-time token
  generateAppToken: function(sessionId){
    return _.uniqueId(this.name);
  },

  // When request hits page, it will call this 
  // function to create token for websocket connection
  // and to get websocket configurtion for connection 
  // to this websocket application
  getWebsocketConfig: function(sessionId, cb){
    var settings = _.pick(this.options, ["protocol", "path", "transports", "host", "port", "name"]);
    var token = this.generateAppToken(sessionId);
    this.tokens[token] = sessionId;
    settings.query = this.options.tokenParam+"="+token;
    cb(null, settings);
  },


  // chainLead creates result object that will collect call results
  chainLead: function(socket, data, cb){         cb(null, socket, data, {} ) },
  chainTail: function(socket, data, result, cb){ cb(null, result );          },
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
        parsed.call(self, socket, data, result, function(err){
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
    var parts         = str.split(/[^|\\][|][^|]/).map(function(s){return s.trim();});
    if(path) parts[2] = path;
    var argGetter     = parts[1]? new Function( "socket, data, result, _", "return [" + parts[1] + "];" ) : this.defaultArgGetter;
    var dataPatcher   = parts[2]? function(data, result){ helpers.patch(result, parts[2], data); }        : this.defaultDataPatcher;
    return function(socket, data, result, cb){
      try{var do_args = argGetter(socket, data, result, _);} catch(err){ return cb(err.stack); }
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
          handler.apply(self, [socket].concat(parsed_args));
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

    return args;
  },

    
  handleRequest: helpers.chain([

    function(req, cb){
      if(!req.headers.cookie) return cb("Authorization failed");
      req.cookies = cookie.parse(req.headers.cookie);
      var sessionCookie = req.cookies["connect.sid"];
      var existingSession = this.sessions.getBy( "cookie", sessionCookie );
      if(existingSession) {
        req.session = existingSession;
        return cb.finish( null, true );
      }
      cb( null, req );
    },
  
    function( req, cb ){

      if(!req._query) return cb("Authorization failed");
      // Check if query param exists
      var request_token = req._query[this.options.tokenParam];
      if(!request_token) return cb("Authorization failed");
      // Check if session id exists under found token
      var session_id = this.tokens[request_token];
      if(!session_id) return cb("Authorization failed");
      // Remove used one-time token
      delete this.tokens[request_token];
      cb(null, req, session_id );
    },

    function( req, session_id, cb ){

      // Check if this session exists
      var session = this.sessions.get(session_id);
      if(session) return cb(null, req, session);
      // If not exist - fetch it from db
      var session = new this.SessionModel({ _id: session_id });
      var self = this;
      session.fetch({ 
        error:   cb, 
        success: function(){
          session.cookie = req.cookies["connect.sid"];
          self.sessions.add( session, { merge: true });
          cb(null, req, session)}, 
      });
    },

    function(req, session, cb){
      // Save session on every change
      session.on( "change", session.save, session );
      // Attach session to request
      req.session = session;
      session.sockets = {};
      cb( null, true );
    }

  ]),


  handleSocket: function(socket){
    // socket.request.session
  },

  handleSession: function(session){

  },

});

module.exports = WebsocketApp;
