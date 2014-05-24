
var fs   = require('fs');
var path = require('path');
var _    = require("underscore");

module.exports = function(cb){
  
  var env = this;
  var config = env.config;
  var app = env.app;
  var pages = env.pages = {};
  
  env.buildPage = function(root, PageClass){
    PageClass.prototype.root = root;
    PageClass.prototype.env  = env;

    var page = pages[root] = new PageClass(env);
    
    if(env.controllers && page.controllers) page.getControllers(env);
    return page;
  }

  if(!env.plasma){
    if(!config.routes || !fs.existsSync(path.join(config.rootDir, config.routes))) return cb();
    
    if(fs.existsSync(path.join(config.rootDir, config.routes, "init.js"))){
      var initializer = require(path.join(config.rootDir, config.routes, "init.js"));
      initializer.call(env, go);
    }
    else go();
  }
  else return cb && cb();


  function go(err){
    if(err) return cb && cb(err);
    
    var routesDir  = path.join(config.rootDir, config.routes);
    var routeFiles = fs.readdirSync(routesDir);

    routeFiles.forEach(function(filename){
      if(filename === "init.js") return;
      var pageObj, PageClass = env.Page;
      var page = require(path.join(routesDir, filename));
      var root = page.root || filename.replace(/(\.js|\.coffee|\.json)$/i, "");

      PageClass = page.apply(env);
      env.buildPage(root, PageClass);

    });

    //this._.debug("", 2, "green", "PAGES END");

    cb && cb(null);
  }
  

};