
var fs   = require('fs');
var path = require('path');
var _    = require("underscore");

module.exports = function(cb){


  // var CloneRPC = require("clone-rpc");
  
  var env = this;
  var config = env.config;
  var app = env.app;
  var pages = env.pages = {};
  
  var controllerAddress = ["core", "controller_0"];

  env.buildPage = function(PageClass, options){
    if(!PageClass.prototype.root)
      PageClass.prototype.root = options?(options.root || "/"):"/";
    PageClass.prototype.env  = env;
    
    var page = pages[root] = new PageClass(env, options);

    //if(env.controllers && page.controllers) page.getControllers(env);
    if(page.app && typeof page.app==="string") env.registerBundle(page);
    pages[page.root] = page;
    return page;
  }

  if(!config.routes || !fs.existsSync(path.join(config.rootDir, config.routes))) return cb();
  
  if(fs.existsSync(path.join(config.rootDir, config.routes, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.routes, "init.js"));
    initializer.call(env, go);
  }
  else go();


  function go(err){
    if(err) return cb && cb(err);
    
    var routesDir  = path.join(config.rootDir, config.routes);
    var routeFiles = fs.readdirSync(routesDir);

    routeFiles.forEach(function(filename){
      if(filename === "init.js") return;
      var fileroot = "/"+filename.replace(/(\.js|\.coffee|\.json)$/i, "");
      var PageClass = require(path.join(routesDir, filename)).apply(env);
      if(typeof PageClass != "function"){
        if(_.isArray(PageClass)) 
          return PageClass.map(function(page){
            page.root = page.root || fileroot;
            return env.Page.extend("page", page);
          }).forEach(function(page){
            env.buildPage(page, page);
          });
        else if(_.isObject(PageClass)) 
          return env.buildPage(env.Page.extend("page", PageClass), PageClass);
        else return;
      }
      else{
        if(!PageClass.prototype.root) PageClass.prototype.root = fileroot;


        if(!PageClass.prototype.config) PageClass.prototype.config = {};

        if(env.config.websocketOptions){
          PageClass.prototype.config = _.extend(PageClass.prototype.config, {websocket: env.config.websocketOptions});
        }

        if(env.config.prefixNodeAddress===true){
          PageClass.prototype.config.websocket = _.extend(
            PageClass.prototype.config.websocket || {},
            {resource: env.config.address+"/socket.io"}
          )          
        }

        env.buildPage(PageClass);
      }
    });
    cb && cb(null);
  }
  

};