
module.exports = {
  mapObject: function(obj, iterator){
    var result = {};
    for(var prop in obj){
      result[prop] = iterator(prop, obj[prop]);
    }
    return result;
  },
  filterObject: function(obj, iterator){
    var result = {};
    for(var prop in obj){
      var val = iterator(prop, obj[prop]);
      if(val) result[prop] = obj[prop];
    }
    return result;
  },
  selfMap: function(arr, method_name, arg1, arg2, arg3, arg4){
    return arr.map(function(el){ return el[method_name].call(el, arg1, arg2, arg3, arg4);});
  }  
};
  
