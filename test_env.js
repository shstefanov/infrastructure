var cluster        = require("cluster");
var infrastructure = require("./index.js");
var _              = require("underscore");

module.exports.start = function(config, cb){

  module.exports.stringified_config = JSON.stringify(config);

  if(config.process_mode === "cluster" && cluster.isMaster){
    cluster.setupMaster({
      exec: __filename,
      args: [ module.exports.stringified_config ]
    });
  }

  var config_copy =  JSON.parse(module.exports.stringified_config);
  config_copy.mode = "test";
  infrastructure( config_copy, function(err, env){
    if(err) return module.exports.cleanup(err, cb);
    module.exports.env = env;
    cb(null, env);
  });
}

module.exports.cleanup = function(err, cb){
  delete module.exports.env;
  delete module.exports.stringified_config;
  cb(err);
};

module.exports.client = function(opts, cb){
  opts = opts || {};
  var jsdom = require("jsdom");

  var client = {cookieJar: jsdom.createCookieJar()};


  var conf = {
      
    features: {
      FetchExternalResources: ["script", "link", "img"],
      ProcessExternalResources: ["script", "link", "img"],
      SkipExternalResources: false
    },

    cookieJar: client.cookieJar,
    headers: opts.headers || {},

    created: function(err, _window){
      if(err) return cb(err);
      var window = client.window = _window;

      // This fixes leaflet (0.7.7) map initialization
      window.HTMLDivElement.prototype.clientWidth  = 500;
      window.HTMLDivElement.prototype.clientHeight = 500;
      
      // This fixes websocket connections
      window.WebSocket = require("ws");
      
      // Call custom handler if any
      opts.created && opts.created(window);
    },
  
  };

  if(opts.onload) conf.onload = opts.onload;

  if(opts.console === true) conf.virtualConsole = jsdom.createVirtualConsole().sendTo(console);

  var resourceCache = {};

  // conf.resourceLoader = function(resource, cb){
  //   var request = require("request");
  //   if(resourceCache[resource.url.href]) {
  //     return setTimeout(function(){
  //         return cb(null, resourceCache[resource.url.href]);
  //     }, 100);
  //   }
  //   request.get(resource.url.href, function(err, response, body){
  //     if(err) return cb(err);
  //     resourceCache[resource.url.href] = body;
  //     cb(null, body);
  //   });
  // }


  function getCookie(){
    var cookie = client.cookieJar.toJSON().cookies.pop();
    return cookie ? cookie.key+"="+cookie.value : null;
  }

  client.post = function(uri, data, cb){
    var request = require("request");
    var url = "http://" + module.exports.env.config.host + uri;
    var cookie = getCookie();
    request.post(url, {
      followRedirect: false,
      form: data,
      headers: cookie ? { cookie: cookie } : {}
    }, function(err, response, body){
      if([301,302].indexOf(response.statusCode) !== -1) {
        return client.get(response.headers.location, cb);
      }

      client.window && client.window.document.close();
      delete client.window;
      delete client.jsd;
      client.jsd = jsdom.env( body, conf, _.once(function (err, window) {
        if(err) return cb(err);
        client.location = uri;
        client.window = window;
        cb(null, window);
      }));
      
    });
  };


  client.get = function(uri, opts, cb){
    if(typeof opts === "function"){
      cb = opts, opts = {};
    }
    var request = require("request");
    var url = "http://" + module.exports.env.config.host + uri;
    var cookie = getCookie();
    request.get(url, {
      followRedirect: false,
      headers: cookie ? { cookie: cookie } : {}
    }, function(err, response, body){
      if([301,302].indexOf(response.statusCode) !== -1) {
        return client.get(response.headers.location, cb);
      }

      client.window && client.window.document.close();
      delete client.window;
      delete client.jsd;
      client.jsd = jsdom.env( body, conf, _.once(function (err, window) {
        if(err) return cb(err);
        client.location = uri;
        client.window = window;
        cb(null, window);
      }));
      
    });

  };

  // Needed just for cookie to be set
  client.visit = function(uri, cb){
    var url = "http://" + module.exports.env.config.host + uri;
    client.jsd = jsdom.env( url, conf, _.once(cb));
  }

  client.reload = function(cb){
    if(!client.location) return cb(new Error("Can't reload - no page loaded"));
    client.get(client.location, cb);
  }


  return client;
}
