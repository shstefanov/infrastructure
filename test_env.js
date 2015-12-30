var cluster        = require("cluster");
var infrastructure = require("./index.js");

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

module.exports.client = function(url, opts, cb){
  if(typeof opts === "function"){
    cb = opts, opts = {};
  }
  var jsdom = require("jsdom");
  // require("colors");
  var window, conf = {
      
    features: {
      FetchExternalResources: ["script", "link", "img"],
      ProcessExternalResources: ["script", "link", "img"],
      SkipExternalResources: false
    },

    cookieJar: jsdom.createCookieJar(),
    headers: opts.headers || {},

    created: function(err, _window){
      if(err) return cb(err);
      window = _window;

      // This fixes leaflet (0.7.7) map initialization
      window.HTMLDivElement.prototype.clientWidth = 500;
      window.HTMLDivElement.prototype.clientHeight = 500;
      
      // This fixes websocket connections
      window.WebSocket = require("ws");
      
      // Call custom handler if any
      opts.created && opts.created(window);
    },

    // onload: function(window){
    //   console.log("onload")
    // }
  
  };

  if(opts.onload) conf.onload = opts.onload;

  if(opts.console === true) conf.virtualConsole = jsdom.createVirtualConsole().sendTo(console);

  if(opts.resources){ // TODO ???
    conf.resourceLoader = function (resource, callback) {
      var pathname = resource.url.pathname;
      if(opts.resources.hasOwnProperty(pathname)){
        var t =setTimeout(function(){
          callback(null, JSON.stringify(opts.resources[pathname]));
        }, 1000 );
      }
      else resource.defaultFetch(callback);
      return {
        abort: function(){
          clearTimeout(t);
          callback(new Error("Resource Loader Error"));
        }
      }
    }
  }
  
  var stuff = jsdom.env( url, conf, function (err, window) {
    if(err) return cb(err);
    cb(null, window); 
  });
}
