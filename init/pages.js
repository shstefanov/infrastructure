
var fs   = require('fs');
var path = require('path');
var _    = require("underscore");

module.exports = function(cb){
  var env = this;
  var config = env.config;
  var app = env.app;
  if(!config.routes || !fs.existsSync(path.join(config.rootDir, config.routes))) return cb();
  
  if(fs.existsSync(path.join(config.rootDir, config.routes, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.routes, "init.js"));
    initializer.call(env, go);
  }
  else go();

  function go(err){
    if(err) return cb(err);
    var routesDir = path.join(config.rootDir, config.routes);
    var pages = env.pages = {};
    var routeFiles = fs.readdirSync(routesDir);

    routeFiles.forEach(function(filename){
      var pageObj, PageClass = env.Page;
      var page = require(path.join(routesDir, filename));
      var root = page.root || filename.replace(/(\.js|\.coffee|\.json)$/i, "");

      // Setting up class name based on filename
      var firstLetter = root[0];
      var className = root.replace(firstLetter, firstLetter.toUpperCase());

      PageClass = page.apply(env);

      PageClass.prototype.root = root;
      PageClass.prototype.env  = env;
      if(!PageClass.prototype.subject) PageClass.prototype.subject = env.subject;
      var page = pages[root] = new PageClass(env);
      if(!page.subject) throw new Error("Page must have 'subject method'");
      page.getControllers(env);

    });

    //this._.debug("", 2, "green", "PAGES END");

    cb(null);
  }
  

};