
var EventedClass = require("../tools/EventedClass");
var path  = require("path");
var _     = require("underscore");

var env;

var Page = EventedClass.extend("Page", {

  constructor: function(_env){
    env = _env;
    if(!this.settings) this.settings = {};
    // env._.debug(env._.debug, 2, "green", "OOOOOOO");
    var _ = require("underscore");
    var page = this;
    var root = this.root;
    var app = env.app;

    if(!this.config) this.config = {root:root};
    else this.config.root = root;

    if(page.pre) app[page.method || "get"]("/"+root+"*", _.bind(page.pre, page));

    for(key in page){
      if(/(^\/|^[*]|^get\s|^post\s|^put\s|^delete\s)/i.test(key)){
        var route = key.match(/(^\/|^[*]|^get\s|^post\s|^put\s|^delete\s)/i);
        if(route.indexOf("/") == 0 || route.indexOf("*") == 0){
          var method = (page.method || "get").toLowerCase();
          var url = route[1];
          if(url == "/") url = "";
        }
        else{
          var method = route[1].replace(/\s$/, "").toLowerCase();
          var url = key.replace(/(^get\s|^post\s|^put\s|^delete\s)/i, "");
        }
        url = path.join(root.trim(), url.trim()).replace(/\\/g, "/");
        url = url.replace("/*", "*");
        console.log("Set up route: ", "/"+url);
        app[method]("/"+url, _.bind(page[key], page)); 
      }
    }

    if(page.after) env.app[page.method || "get"]("/"+root+"*", _.bind(page.after, page));
    
    // if(page.app) {
    //   var mountPoint = env.registerBundle(page);
    //   if(!this.javascripts) this.javascripts = [mountPoint];
    //   else this.javascripts.push(mountPoint);
    // }
  },

  render: function(req, res){
    res.data = this.assets(res.data);
    res.render(this.template, res.data);
  },

  assets: function(data){
    data = data||{};
    data.meta           = _.extend({},this.meta||{},data.meta||{});
    data.javascripts    = _.union(this.javascripts || [], data.javascripts || [], this.apps||[]);
    data.styles         = _.union(this.styles || [], data.styles || []);
    data.settings       = JSON.stringify(_.extend({root:this.root}, this.settings, data.settings));
    data.title          = data.title || (typeof this.title === "function"?this.title(data) : this.title);
    return data;
  },

  getControllers: function(env){
    this.controllers = _.pick(env.controllers, this.controllers || []);
    env._.cleanObject(this.controllers);
  },

  getSubject: function(session, cb){

    var save = false;
    if(!session._id) {save = true; session._id = _.uniqueId("s_");}
    var subject = env.subjects.add({_id: session._id});
    if(!save) {
      cb(null, subject );
      subject.sockets.once("disconnect", env.subjects.remove, env.subjects);
    }
    else session.save(function(err){
      if(err) return cb(err); 
      cb(null, subject);
      subject.sockets.once("disconnect", env.subjects.remove, env.subjects);
    });
  }

});

module.exports = Page;