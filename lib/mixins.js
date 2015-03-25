

module.exports = function(){
  
  require("colors");
  var _     = require("underscore");
  var fs    = require("fs");
  var path  = require("path");

  this._    = {config:this.config};

  var f = "function";

  var env = this;

  var mongodb  = require("mongodb");
  var ObjectID = mongodb.ObjectID;
  var DBRef    = mongodb.DBRef;


  var line      = ".................................";
  var shortline = ".................";
  _.extend(env, {

    log: function(logName, value){
      if(!this.config.log) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("["+date+"]"+(this.config.address?("["+this.config.address+"]"+shortline.slice(this.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
    },

    sys: function(logName, value){
      if(!this.config.syslog) return;
      var date = new Date().toISOString().replace(/\..*$/, "").replace("T", " ");
      console.log("["+date+"]"+(this.config.address?("["+this.config.address+"]"+shortline.slice(this.config.address.length)):"")+"["+logName+"]"+line.slice(logName.length), value);
    }
  });

  _.extend(this._, {

    ObjectID: ObjectID,
    DBRef:    DBRef,

    isOneOf: function(){
      var comparators = Array.prototype.slice.call(arguments);
      return function(val){
        return _.some(comparators, function(comparator){
          return comparator(val);
        });
      }
    },

    everyIs: function(comparator){
      return function(val){
        return _.isArray(val) && _.every(val, comparator);
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













function newAmapAndChain(){


  var helpers = {
    chain: function(fns, context){
      var self = this;
      fns = fns.map(function(f){
        if(typeof f !== "function") {
          var that = self;
          return function(){
            var ctx = this;
            var args = Array.prototype.slice.call(arguments);
            var chain_cb = args.pop();
            that.amap(f, function(ob_fn, amap_cb){
              ob_fn.apply(ctx, args.concat([amap_cb]));
            }, chain_cb);
          };
                  // this.amapCompose(f, function(f, cb){}, cb);        
        }
        else{
          return f;
        }
      });


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

    runFnsIterator: function(fn, cb){fn(cb);},

    amapCompose: function(obj, iterator){
      var self = this;
      return function(ob, itr, cb){
        self.amap( ob||obj, itr||iterator, cb);
      }
    },

    amap: function(arr, iterator, cb){
      if(!iterator) iterator = this.runFnsIterator;
      else if(Array.isArray(iterator)) iterator = this.chain(iterator);
      var results, counter;
      if(!Array.isArray(arr)){
        results = {};
        counter = Object.keys(arr).length;
        arr.forEach = function(itr){
          for(var key in arr) {
            if(key==="forEach") continue;
            itr(arr[key], key, arr);
          }
        }
      }
      else{
        counter = arr.length;
        results = new Array(arr.length);
      }
      if(counter===0) return cb(null, arr);

      var  error;
      arr.forEach(function(el, idx, arr){
        setTimeout(function(){
          iterator(el, function(err, result){
            if(error === true) return;
            if(err){error = true; return cb(err);}
            results[idx] = result;
            counter--;
            if(counter===0) {
              cb(null, results);
            }
          });
        }, 0);
      });
      if(!Array.isArray(arr)) delete arr.forEach;
    }
  };

  // Normal usage
  helpers.amap([1,2,3,4,5], function(n, cb){
    setTimeout(function(){
      cb(null, n*n*n);
    },1000);
  }, function(err, result){
    console.log("normap amap", result);
  });

  var fns = [1,2,3,4,5].map(function(n){return function(cb){setTimeout(function(){cb(null, n*n*n)}, 2000);};});
  helpers.amap(fns, null, function(err, results){
    console.log("run fns amap", results);
  });

  var iterators = [1,2,3,4,5].map(function(n){
    return function(target, cb){
      setTimeout(function(){
        cb(null, Math.pow(target, n)); 
      }, 1000);
    }
  });

  helpers.amap([1,2,3,4,5], iterators, function(err, results){
    console.log("multiple iterators amap", results);
  });

  helpers.amap({
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5
  }, iterators, function(err, results){
    console.log("amaping object amap", results);
  });

  var composed = helpers.amapCompose({
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5
  }, iterators, function(err, results){
    console.log("amaping object amap", results);
  });

  composed(null, null, function(err, results){
    console.log("amaping composed amap", results);
  });



  var ch = helpers.chain([
    function(arg, cb){
      console.log("first");
      setTimeout(function(){
        cb(null, {a:5, b:6});
      }, 1000);
    },


    {
      aaa: function(obj, cb){  setTimeout(function(){cb(null, {aaa: obj}); }, 1000)  },
      bbb: function(obj, cb){  setTimeout(function(){cb(null, {bbb: obj}); }, 2000)  },
      ccc: function(obj, cb){  setTimeout(function(){cb(null, {ccc: obj}); }, 3000)  },
      ddd: function(obj, cb){  setTimeout(function(){cb(null, {ddd: obj}); }, 4000)  },
    },


     function(arg, cb){
      console.log("after");
      setTimeout(function(){
        cb(null, arg, "else");
      }, 1000);
    },


  ])

  ch(12, function(err, result){
    console.log("adv chain result: ", arguments);
  });

}

