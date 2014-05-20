
var Class = require("../tools/Class");

var path = require("path");
var _ = require("underscore");

var Page = Class.extend("Page", {

  constructor: function(env){

    if(!this.settings) this.settings = {};
    // env._.debug(env._.debug, 2, "green", "OOOOOOO");
    var _ = require("underscore");
    var page = this;
    var root = this.root;
    var app = env.app;

    if(page.pre) app[page.method || "get"]("/"+root+"*", _.bind(page.pre, page));

    for(key in page){
      if(/(^\/|^[*]|^get\s*?|^post\s*?|^put\s*?|^delete\s*?)/i.test(key)){
        var route = key.match(/(^\/|^[*]|^get\s*?|^post\s*?|^put\s*?|^delete\s*?)/i);
        if(route.indexOf("/") == 0 || route.indexOf("*") == 0){
          var method = (page.method || "get").toLowerCase();
          var url = route[1];
          if(url == "/") url = "";
        }
        else{
          var method = route[1].replace(/\s$/, "").toLowerCase();
          var url = key.replace(/(^get\s*?|^post\s*?|^put\s*?|^delete\s*?)/i, "");
        }
        url = path.join(root.trim(), url.trim()).replace(/\\/g, "/");
        url = url.replace("/*", "*");
        // env._.debug("/"+url, 2, "green", "PAGE URL");
        app[method]("/"+url, _.bind(page[key], page)); 
      }
    }

    if(page.after) env.app[page.method || "get"]("/"+root+"*", _.bind(page.after, page));
    
    if(page.app) {
      var mountPoint = env.registerBundle(page);
      if(!this.javascripts) this.javascripts = [mountPoint];
      else this.javascripts.push(mountPoint);
    }
  },

  render: function(req, res){
    this.assets(req, res);
    res.render(this.template, res.data);
  },

  assets: function(req, res){
    res.data                = res.data || {};
    res.data.meta           = _.extend({},this.meta||{},res.data.meta||{});
    res.data.config         = JSON.stringify(this.config || {});
    res.data.styles         = _.union(this.styles || [], res.data.styles || []);
    res.data.settings       = JSON.stringify(_.extend({root:this.root}, this.settings, res.data.settings));
    res.data.title          = res.data.title || (typeof this.title === "function"?this.title(req, res) : this.title);
    res.data.javascripts    = _.union(this.javascripts || [], res.data.javascripts || []);
    if(this.mountPoint) res.data.javascripts.push(this.mountPoint);
  },

  getControllers: function(env){
    this.controllers = _.pick(env.controllers, this.controllers || []);
    env._.cleanObject(this.controllers);
  },

  subject: function(session, cb){
    cb(null, new this.env.Model());
  }

});

module.exports = Page;