

module.exports = function(){
  
  var _     = require("underscore");
  var fs    = require("fs");
  var path  = require("path");

  this._    = {config:this.config};

  var f = "function";

  var env = this;

  var line      = "............................................................";
  var shortline = ".................";

  _.extend(env, {

    log: function(logName, value){
      if(!this.config.log) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      var id = "["+date+"]"+"["+(env.config.type||"main")+"]"+(this.config.id? "["+this.config.id+"]":"[main]")+("["+logName+"]");
      console.log(id+line.slice(id.length), value);
    },

    sys: function(logName, value){
      if(!this.config.syslog) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      var id = "["+date+"]"+"["+(env.config.type||"main")+"]"+(this.config.id? "["+this.config.id+"]":"[main]")+("["+logName+"]");
      console.log(id+line.slice(id.length), value);
    }
  });

  _.extend(this._, {

    isOneOf: function(){
      var comparators = Array.prototype.slice.call(arguments);
      return function(val){
        return _.some(comparators, function(comparator){
          return comparator(val);
        });
      }
    },

    isObjectID: function(val){
      return val instanceof ObjectID;
    },

    isDBRef: function(val){
      return val instanceof DBRef;
    },

    // Like array.map, but works with objects
    mapObject: function(obj, iterator){
      var result = {};
      for(key in obj){
        result[key] = iterator(key, obj[key]);
      }
      return result;
    },


    filterObject: function(obj, iterator){
      var result = {};
      for(key in obj)
        !!iterator(key, obj[key]) && (result[key] = obj[key]);
      return result;
    },

    inherit:function(obj1, obj2){
      return _.extend(_.clone(obj1), obj2);
    },

    remap: function(obj, iterator){
      var result = {};
      for(key in obj){
        var res = iterator(key, obj[key]);
        if(res) _.extend(result, res);
      }
    },

    //Warning !!! - changing passed object
    cleanObject: function(obj){ for(key in obj) !obj[key] && (delete obj[key]); },

    everyIs: function(iterator){ return function(val){ return _.isArray(val) && _.every(val, iterator);} },


    // Takes number n and returns function that can be executed n times
    // when n becomes 0, will be executed callback m in context C with arguments a,b and c
    counter: function(n,m,C,a,b,c){return function(){n--;n===0&&m.call(C||this,a,b,c)}},
    
    // Generates a chain of functions
    chain: function(fns, context){
      return function(){
        var cb, ctx = context || this, ch = fns, ptr = -1;
        var args = Array.prototype.slice.call(arguments);
        var cb = args.pop();
        if(typeof cb !== "function") ctx = cb, cb = args.pop();
        if(typeof cb !== "function") throw new Error("Got you!!");
        if(fns.length){
          ptr++;
          args.push(next);
          fns[0].apply(ctx, args);
        }
        else{
          args.unshift(null);
          cb.apply(ctx, args);
        }
        function next(){
          var err = arguments[0];
          if(err) return cb(err);
          if(!ch[++ptr]) return cb.apply(ctx, arguments);
          try{ch[ptr].apply(ctx, Array.prototype.slice.call(arguments, 1).concat([next]));}
          catch(err){cb(err);}
        }
      }
    },

    amap: function(arr, iterator, cb){
      if(arr.length===0) return cb(null, arr);
      var results = new Array(arr.length), counter = arr.length, error;
      arr.forEach(function(el, idx, arr){
        setTimeout(function(){
          iterator(el, function(err, result){
            if(error === true) return;
            if(err){error = true; return cb(err);}
            results[idx] = result;
            counter--;
            if(counter===0) cb(null, results);
          });
        }, 0);
      });
    },

    dirToObject: function(dir, iterator, parent){
      var content = fs.readdirSync(dir);
      var result = {};
      if(content.length == 0) return result;
      for(index in content){ var name = content[index];
        if(name.indexOf("_")===0) continue;
        var full_path = path.join(dir, name);
        var node_name = name.replace(/\.[a-z]+$/i, "");
        
        if(fs.statSync(full_path).isDirectory()) 
          result[node_name] = this.dirToObject(full_path, iterator, node_name);
        else 
          result[node_name] = iterator? iterator(node_name, parent, require(full_path)): require(full_path);
      }
      return result;
    },

    debug: function (val, lines, color, message){
      message = message || "APP DEBUG";
      color = color || "green" ;
      var line = "------------------------------";
      var spaces = "                               ";
      var full_line = ("|"+line+"-"+message.replace(/.+?/g, "=")+"-"+line+"|").yellow;
      var err = new Error();
      console.log(full_line);
      console.log(("|"+spaces).yellow+message[color]+(spaces+"|").yellow);
      console.log(full_line);
      console.log(
        err.stack
        .split("\n")
        .slice(2, 2+lines || 3)
        .map(function(r){return "|".yellow+"  "+r.trim()[color]})
        .join("\n")
      )
      console.log(full_line);
      console.log(val);
      return val;
    },

    parseArgs: function(a){
      var r    = { params: Array.prototype.call.slice(a), ctx: global};
      var last = Array.prototype.call.slice(a, -2);
      var l1   = last.pop();
      var l2   = last.pop();
      if(typeof l1 === "function"){
        r.cb   = r.params.pop();
        return r;
      }
      else if(typeof l2 === "function"){
        r.ctx  = r.params.pop();
        r.cb   = r.params.pop();
        return r;
      }
      return r;
    }

  });

  
 
};

