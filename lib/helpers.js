var _ = require("underscore");
var helpers = module.exports = {
  
  everyIs: function(iterator){ return function(val){ return _.isArray(val) && _.every(val, iterator);} },

  isOneOf: function(){
    var comparators = Array.prototype.slice.call(arguments);
    return function(val){
      return _.some(comparators, function(comparator){
        return comparator(val);
      });
    }
  },

  deepExtend: function(target, source){
    for(var key in source){
      if(_.isObject(target[key]) && _.isObject(source[key])){
        helpers.deepExtend(target[key], source[key]);
      }
      else { target[key] = source[key]; }
    }
  },

  filterObject: function(obj, iterator){
    var result = {};
    for(key in obj)
      !!iterator(key, obj[key]) && (result[key] = obj[key]);
    return result;
  },

  //Warning !!! - changing passed object
  cleanObject: function(obj){ for(key in obj) !obj[key] && (delete obj[key]); },

  // Takes number n and returns function that can be executed n times
  // when n becomes 0, will be executed callback m in context C with arguments a,b and c
  counter: function(n,m,C,a,b,c){return function(){n--;n===0&&m.call(C||this,a,b,c)}},
  
  // Generates a chain of functions
  chain: function(fns, context){
    var self = this;
    fns = fns.map(function(f){
      if(typeof f !== "function") {
        return function(){
          var ctx = this;
          var args = Array.prototype.slice.call(arguments);
          var chain_cb = args.pop();
          helpers.amap(f, function(ob_fn, amap_cb){
            ob_fn.apply(ctx, args.concat([amap_cb]));
          }, chain_cb);
        };
      }
      else{
        return f;
      }
    });

    var ft = "function", sl = [].slice, em = "callback not found!!";
    return function(){
      var cb,c=context||this,ch=fns,ptr=-1;
      var a=sl.call(arguments);
      cb = a.pop();
      if(typeof cb!==ft) c=cb,cb=a.pop();
      if(typeof cb!==ft) throw new Error(em);
      var n=function(){
        var e=arguments[0];
        if(e) return cb(e);
        if(!ch[++ptr]) return cb.apply(c, arguments);
        try{ch[ptr].apply(c,sl.call(arguments,1).concat([n]));}
        catch(e){cb.call(c,e);}
      }
      n.finish=cb;
      if(fns.length){
        ptr++;
        a.push(n);
        fns[0].apply(c,a);
      }
      else{
        a.unshift(null);
        cb.apply(c,a);
      }
    };

  },

  // minified chain
  // chain: function(n,t){return n=n.map(function(n){return"function"!=typeof n?function(){var t=this,a=sl.call(arguments),r=a.pop();h.amap(n,function(n,r){n.apply(t,a.concat([r]))},r)}:n}),function(){var a,r=t||this,p=n,u=-1,c=sl.call(arguments),a=c.pop();if("function"!=typeof a&&(r=a,a=c.pop()),"function"!=typeof a)throw new Error("callback not found!!");var l=function(){var n=arguments[0];if(n)return a(n);if(!p[++u])return a.apply(r,arguments);try{p[u].apply(r,sl.call(arguments,1).concat([l]))}catch(n){a.call(r,n)}};l.finish=a,n.length?(u++,c.push(l),n[0].apply(r,c)):(c.unshift(null),a.apply(r,c))}};

  amapCompose: function(obj, iterator){
    return function(ob, itr, cb){
      helpers.amap( ob||obj, itr||iterator, cb, this);
    }
  },

  runFnsIterator: function(fn, cb){fn(cb);},
  amap: function(arr, iterator, cb, ctx){
    ctx = ctx || this;
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
        iterator.call(ctx, el, function(err, result){
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
  },

  defaultize: function(base, target){
    if(Array.isArray(target)) target.forEach(function(t){_.defaults(t, base)});
    else{
      for(var key in target){
        _.defaults(target[key], base);
      }
    }
    return target;
  },

  instantiate: function(objects, Prototype){
    if(_.isArray(objects)){
      return objects.map(function(object){
        return new Prototype(object);
      });
    }
    else if(_.isObject(objects)){
      var result = {};
      for(var key in objects){
        result[key] = new Prototype(objects[key]);
      }
      return result;
    }
    else{
      return new Prototype(objects);
    }
  },

  traverse: function(obj, iterator){
    for(var key in obj){
      (function(name, val){
        if(_.isObject(val) && (typeof val !== "function")){
          return helpers.traverse(val, iterator);
        }
        iterator(val, name, obj);
      })(key, obj[key]);
    }
  },

  resolve: function(target, path){

    var parts = path.split("."), parent = target, last_target = parts.pop();
    for(var i = 0; i< parts.length; i++){
      if(!parent.hasOwnProperty(parts[i]) && !parent.__proto__.hasOwnProperty(parts[i])){
        return undefined;
      }
      parent = parent[parts[i]];
    }
    return parent[last_target];
    
  },

  patch: function(target, path, val){

    if(typeof path === "object"){
      for(var key in path) helpers.patch(target, key, path[key]);
      return;
    }

    var parts = path.split("."), parent = target, last_target = parts.pop();
    for(var i = 0; i< parts.length; i++){
      if(!parent.hasOwnProperty(parts[i]) && !parent.__proto__.hasOwnProperty(parts[i])){
        parent[parts[i]] = {};
      }
      parent = parent[parts[i]];
    }

    var real_target = (!parent[last_target] && !parent.__proto__[last_target] ? parent : ( !parent.__proto__[last_target] ? parent : parent.__proto__ ) );
    real_target[last_target] = val;
    
  }

};
