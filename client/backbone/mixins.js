

_.mixin({

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
  simpleCompose: function(fns, context){
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



});