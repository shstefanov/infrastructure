var Class = require("../tools/Class");
var path  = require("path");
var _     = require("underscore");
//require("colors");
// var env;

var line = "       ";

var renderTemplate = function(template){
  return function(req, res){ res.render(template, res.data||{}); };
}

var Page = Class.extend("Page", {



  constructor: function(env){
    var self = this, app = env.app;
    this.env = env;
    if(this.pre) env.app.all(this.root+"*", function(req,res,next){self.pre(req,res,next);});
    for(var key in this){
      if(key.match(/^GET\s|^POST\s|^PUT\s|^DELETE\s|^ALL\s/)){
        (function(key){
          var parts  = key.split(/\s+/);
          var method = parts[0].toLowerCase();
          var route  = path.join(self.root, parts[1]).replace(/\\/g, "/");
          var target = self[key];
          if(_.isFunction(target)){
            app[method](route, function(){self[key].apply(self, arguments);});
          }
          else if(_.isString(target)){
            app[method](route, self.createCallFromString(target));
          }
          else if(_.isArray(target)){
            target.forEach(function(t, index, arr){
              if(_.isFunction(t))    app[method](route, function(req,res,next){t.apply(self, arguments);});
              else if(_.isString(t)) app[method](route, self.createCallFromString(t, index!==(arr.length-1)));
              else if(_.isObject(t)) app[method](route, self.createParallelCall(t, index!==(arr.length-1)));
            });

          }
          else if(_.isObject(target)){
            app[method](route, self.createParallelCall(target));
          }

          env.sys("HTTP", "Setting up route: "+ method.toUpperCase()+line.slice(method.length)+ route);

        })(key);

      }
    }
    if(this.after) env.app.all(this.root+"*", function(req,res,next){self.after(req,res,next);});
  },

  // Strip them from request object and send them to remote method
  callAttributes: ["params", "query", "body", "session"],


  createCallFromString: function(target, multi){

    if(target.indexOf(".")===-1){
      return multi? function(req, res, next){res.data = _.extend(res.data || {}, {template: target}); next()}
      : function(req, res){res.render(target, res.data||{})} 
    }
    else{
      var self = this, env = this.env;
      return multi? function(req, res, next){
        var attributes = _.pick(req, self.callAttributes);
        env.call(target, attributes, function(err, result){
          if(err) return next(err);
          res.data = _.extend(res.data||{},result||{});
          next();
        });
      }
      :function(req, res, next){
        var attributes = _.pick(req, self.callAttributes);
        env.call(target, attributes, function(err, result){
          if(err) return next(err);
          res.data = _.extend(res.data||{},result||{});
          res.render(self.template, result);
        });
      };
    }
  },

  createParallelCall: function(target, isPartOfChain){
    var self = this, env = this.env;
    var targetsIterators = _.keys(target).map(function(address){
      var timeout = target[address];
      if(_.isFunction(timeout)) return [timeout];
      if(timeout === 0){
        return function(attributes, cb){
          env.call(address, attributes, cb);
        }
      }
      else{
        return function(attributes, cb){
          var timeouted = false;
          var tm = setTimeout(function(){
            timeouted = true;
            env.dropCallback(callback);
            cb("Error: timeout: "+timeout+"s");
          }, timeout * 1000);

          var callback = function(err, result){
            if(!timeouted){
              clearTimeout(tm);
              if(err) cb(err);
              else cb(null, result)
            }
          }
          env.call(address, attributes, callback);
        }
      }
    })
    if(isPartOfChain){
      return function(req, res, next){
        var attributes = _.pick(req, self.callAttributes);
        env._.amap(targetsIterators, function(itr, cb){
          if(_.isArray(itr)) return itr[0](req, res, cb);
          itr(attributes, cb);
        }, function(err, results){
          if(err) return next(err);
          var result = {};
          results.forEach(function(r){
            _.extend(result, r);
          });
          res.data = _.extend(res.data || {}, result);
          next();
        });
      }
    }
    else{
      return function(req, res, next){
        var attributes = _.pick(req, self.callAttributes);
        env._.amap(targetsIterators, function(itr, cb){
          if(_.isArray(itr)) return itr[0](req, res, cb);
          itr(attributes, cb);
        }, function(err, results){
          if(err) return next(err);
          var result = {};
          results.forEach(function(r){
            _.extend(result, r);
          });
          res.data = _.extend(res.data || {}, result);
          self.render(req, res);
        });
      }
    }
  },





  // constructor: function(env){

  //   this.env = env;
  //   var app = env.app;
  //   var root = this.root;
    
  //   if(!this.settings) this.settings = {};
    
  //   // This config will be sent to client app to help for organizing frontend routes.
  //   if(!this.config) this.config     = {root:root};
  //   else this.config.root            = root;
  //   var page = this;

  //   var globMeths = {
  //     get:0,
  //     post:0,
  //     put:0,
  //     "delete":0
  //   }; 
  //   var handlers = [];
  //   var queue = [];
  //   var glob = !!page.pre || !!page.after || false;

  //   for(key in page){
  //     if(/(^\/|^[*]|^get\s|^post\s|^put\s|^delete\s)/i.test(key)){
  //       var bind = true;
  //       if(typeof page[key]==="string") {
  //         if(page.app) {
  //           if(typeof page[page[key]] === "function") page[key] = page[page[key]];
  //           else page[key] = page.render;
  //         }  
  //         else{
  //           bind = false;
  //           page[key] = renderTemplate(page[key]);
  //         }
  //       }
  //       else if(typeof page[key]!="function") return this;
  //       var route = key.match(/(^\/|^[*]|^get\s|^post\s|^put\s|^delete\s)/i);
  //       if(route.indexOf("/") == 0 || route.indexOf("*") == 0){
  //         var method = (page.method || "get").toLowerCase();
  //         var url = key;
  //       }
  //       else{
  //         var method = route[1].replace(/\s$/, "").toLowerCase();
  //         var url = key.replace(/(^get\s|^post\s|^put\s|^delete\s)/i, "");
  //       }
  //       url = path.join(root.trim(), url.trim()).replace(/\\/g, "/");
  //       url = url.replace("/*", "*");
  //       route = url.replace(/(\/*)?/, "/").replace(/\/$/, "").replace(/\s/g,"");
  //       if(route==="") route = "/"
        
  //       if(page.pre) {
  //         if(!globMeths[method+"_pre"]){
  //           handlers.unshift({
  //             method: method,
  //             route: page.root+"*",
  //             handler: page.pre,
  //             action: "pre"
  //           })
  //           globMeths[method+"_pre"] = true;
  //         }
  //       }
        
  //       if(typeof page[key]!=="function") {
  //         if(!_.isArray(page[key]))
  //           page[key] = renderTemplate(key.replace(/^\//,""), options);
  //       }

  //       handlers.push({
  //         method: method,
  //         route: route.trim(),
  //         handler: page[key]
  //       })

  //       if(page.after) {
  //         if(!globMeths[method+"_after"]){
  //           queue.push({
  //             method: method,
  //             route: page.root+"*",
  //             handler: page.after,
  //             action: "after"
  //           })
  //           globMeths[method+"_after"] = true;
  //         }
  //       }
  //     }
  //   }

  //   var line = "       ";
  //   handlers.concat(queue).forEach(function(obj){
  //     env.sys("HTTP", "Setting up route: "+ obj.method.toUpperCase()+line.slice(obj.method.length)+ obj.route);
  //     if(_.isArray(obj.handler)){
  //       obj.handler.forEach(function(h){
  //         app[obj.method](obj.route, h.bind(page));
  //       })
  //     }
  //     else app[obj.method](obj.route, obj.handler.bind(page));
  //   })
  // },

  render: function(req, res){
    var data = this.assets(res.data);
    console.log("render: ", data);
    res.render(data.template || this.template, data);
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