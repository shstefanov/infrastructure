var Class = require("../tools/Class");
var path  = require("path");
var _     = require("underscore");

var line = "       ";

var Page = Class.extend("Page", {

  constructor: function(env){
    var self = this, app = env.app;
    this.env = env;
    if(this.pre) {
      env.app.all(this.root+"*", function(req,res,next){self.pre(req,res,next);});
      env.sys(this.root, "Setting up route: ALL"+line.slice("ALL".length)+ this.root+"*");
    }
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

          env.sys(self.root, "Setting up route: "+ method.toUpperCase()+line.slice(method.length)+ route);

        })(key);

      }
    }
    if(this.after) {
      env.app.all(this.root+"*", function(req,res,next){self.after(req,res,next);});
      env.sys(this.root, "Setting up route: ALL"+line.slice("ALL".length)+ this.root+"*");
    }
  },

  // Strip them from request object and send them to remote method
  callAttributes: ["params", "query", "body", "session"],

  createCallFromString: function(target, multi){
    var self = this, env = this.env;
    var customAttributes;
    if(target.indexOf("|")!==-1){
      var parts = target.split("|").map(function(p){return p.trim();});
      target = parts[0];
      customAttributes = parts[1];
    }

    if(target.indexOf(".")===-1){
      return multi? function(req, res, next){res.data = _.extend(res.data || {}, {template: target}); next()}
      : function(req, res){res.render(target, res.data||{})} 
    }
    else{
      var getAttributes;
      if(customAttributes){
        getAttributes = function(req){
          with(req){ return eval("("+customAttributes+")"); }
        }
      }
      else if(_.isFunction(self.callAttributes)){
        getAttributes = function(req){
          return self.callAttributes(req);
        }
      }
      else{
        getAttributes = function(req){
          return _.pick(req, self.callAttributes)
        }
      }

      return multi? function(req, res, next){
        var attributes = getAttributes(req);
        env.call(target, attributes, function(err, result){
          if(err) return next(err);
          res.data = _.extend(res.data||{},result||{});
          next();
        });
      }
      :function(req, res, next){
        var attributes = getAttributes(req);
        env.call(target, attributes, function(err, result){
          if(err) return next(err);
          res.data = _.extend(res.data||{},result||{});
          self.render(req, res);
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

  render: function(req, res){
    var data = this.assets(res.data);
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
  }

});

module.exports = Page;