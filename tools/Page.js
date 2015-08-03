var EventedClass = require("../tools/EventedClass");
var path  = require("path");
var _     = require("underscore");
require("colors");
var env;

var renderTemplate = function(template){
  return function(req, res){ res.render(template, res.data||{}); };
}

var Page = EventedClass.extend("Page", {

  constructor: function(env){

    this.env = env;
    var app = env.app;
    var root = this.root;
    
    if(!this.settings) this.settings = {};
    
    // This config will be sent to client app to help for organizing frontend routes.
    if(!this.config) this.config     = {root:root};
    else this.config.root            = root;
    var page = this;

    var globMeths = {
      get:0,
      post:0,
      put:0,
      "delete":0
    }; 
    var handlers = [];
    var queue = [];
    var glob = !!page.pre || !!page.after || false;

    for(var key in page){
      if(/(^\/|^[*]|^get\s|^post\s|^put\s|^delete\s)/i.test(key)){
        var bind = true;
        if(typeof page[key]==="string") {
          if(page.app) {
            if(typeof page[page[key]] === "function") page[key] = page[page[key]];
            else page[key] = page.render;
          }  
          else{
            bind = false;
            page[key] = renderTemplate(page[key]);
          }
        }
        else if(typeof page[key]!="function") return this;
        var route = key.match(/(^\/|^[*]|^get\s|^post\s|^put\s|^delete\s)/i);
        if(route.indexOf("/") == 0 || route.indexOf("*") == 0){
          var method = (page.method || "get").toLowerCase();
          var url = key;
        }
        else{
          var method = route[1].replace(/\s$/, "").toLowerCase();
          var url = key.replace(/(^get\s|^post\s|^put\s|^delete\s)/i, "");
        }
        url = path.join(root.trim(), url.trim()).replace(/\\/g, "/");
        url = url.replace("/*", "*");
        route = url.replace(/(\/*)?/, "/").replace(/\/$/, "").replace(/\s/g,"");
        if(route==="") route = "/"
        
        if(page.pre) {
          if(!globMeths[method+"_pre"]){
            handlers.unshift({
              method: method,
              route: page.root+"*",
              handler: page.pre,
              action: "pre"
            })
            globMeths[method+"_pre"] = true;
          }
        }
        
        if(typeof page[key]!=="function") {
          if(!_.isArray(page[key]))
            page[key] = renderTemplate(key.replace(/^\//,""), options);
        }

        handlers.push({
          method: method,
          route: route.trim(),
          handler: page[key]
        })

        if(page.after) {
          if(!globMeths[method+"_after"]){
            queue.push({
              method: method,
              route: page.root+"*",
              handler: page.after,
              action: "after"
            })
            globMeths[method+"_after"] = true;
          }
        }
      }
    }

    var line = "       ";
    handlers.concat(queue).forEach(function(obj){
      env.sys("HTTP", "Setting up route: "+ obj.method.toUpperCase()+line.slice(obj.method.length)+ obj.route);
      if(_.isArray(obj.handler)){
        obj.handler.forEach(function(h){
          app[obj.method](obj.route, h.bind(page));
        })
      }
      else app[obj.method](obj.route, obj.handler.bind(page));
    })
  },

  render: function(req, res){
    res.render(this.template, this.assets(res.data));
  },

  assets: function(data){
    data = data||{};
    data.meta           = _.extend({},this.meta||{},data.meta||{});
    data.javascripts    = _.union(this.javascripts || [], data.javascripts || [], this.apps||[]);
    data.styles         = _.union(this.styles || [], data.styles || []);
    data.config         = JSON.stringify(_.extend({root:this.root}, this.config, data.config));
    data.title          = data.title || (typeof this.title === "function"?this.title(data) : this.title);
    return data;
  },

  getControllers: function(env){
    this.controllers = _.pick(env.controllers, this.controllers);
    env._.cleanObject(this.controllers);
  },

  getSubject: function(session, cb){
    cb("getSubject not implemented!!!");
  }

});

module.exports = Page;