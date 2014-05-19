

module.exports = function(){
  
  require("colors");
  var _     = require("underscore");
  var fs    = require("fs");
  var path  = require("path");

  this._    = {config:this.config};
  _.extend(this._, {

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
        next.apply(ctx, args);

        function next(){
          var err = arguments[0];
          if(err) return cb(err);
          if(!ch[++ptr]) return cb.apply(ctx, arguments);
          try{ch[ptr].apply(ctx, Array.prototype.slice.call(arguments, 1).concat([next]));}
          catch(err){cb(err);}
        }
      }
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
      try{throw new Error()}
      catch(err){
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
      }
      console.log(full_line);
      console.log(val);
      return val;
    }

  });
 
};
