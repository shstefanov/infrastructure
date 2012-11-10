
var ResourceManager = module.exports = function(store, options){
  this.options = options || {};
  this.store = store || {};
};

ResourceManager.prototype.pathFinder = 
 function(address, value, options, callback){
    var self = this;
    var path = address.split(options.delimiter || this.options.delimiter || ".");
    var last = options.target || this.store;

    //level 1 variables
    if(!path[1]){
      if(options.mode == "set" || options.mode == "push") {
        if(callback) callback(null, last[path[0]]);
        return last[path[0]] = value;
      }else if(options.mode == "pull"){ //Pull request - return found object and delete it from store or target
        var result = last[path[0]];
        delete last[path[0]];
        return result;
      }
      else {
        if(callback) {
          if(last[path[0]] === undefined) callback("Not found or undefined");
          else callback(null, last[path[0]]);
        }
        return last[path[0]];
      }
    }

    //Going deeper
    var find = function(node){
      if(last === undefined) console.log("last-undefined",address, options);

      if(!node[1]){ //It is last queried level
        if(options.mode == "pull") {
          var result = last[node[0]];
          delete last[node[0]];
          return result;
        }
        else if(last[node[0]] === undefined){ //Not found
          if(options.mode == "set" || options.mode == "push") { //If push or set mode
            if(callback) callback(null, last[node[0]]);
            return last[node[0]] = value;
          }
          else { //Get mode
            if(callback) callback("Not found or undefined");
            return undefined;
          }
        }
        else{ //Found
          if(callback) callback(last[node[0]]);
          return last[node[0]];
        }
      }
      else { //There are more levels
        if(options.mode == "push" && last[node[0]] == undefined) last[node[0]] = {};
        if(options.mode == "pull" && last[node[0]] == undefined) {
          if(callback) callback("Can't find path to pull");
          return undefined;
        }
        if(options.mode == "get" && last[node[0]] == undefined) {
          if(callback) callback("Can't get path "+address);
          return undefined;
        }
        last = last[node.shift()];
        return find(node);
      }
    };

    if(options.mode == "push") {
      if(last[path[0]] === undefined) last[path[0]] = {};
    }
    last = last[path.shift()];
    return find(path);
  };


ResourceManager.prototype.get = 
  function(address, delimiter, target, callback){
    var opt = {mode:"get", target:target};
    opt.delimiter = delimiter || this.options.delimiter;
    return this.pathFinder(address, false, opt, callback);
};

ResourceManager.prototype.set = function(address, value, delimiter, target, callback){
  var opt = {mode:"push", target:target};
  opt.delimiter = delimiter || this.options.delimiter;
  return this.pathFinder(address, value, opt, callback);
};

ResourceManager.prototype.pull = function(address, target, callback){
  var opt = {mode:"pull", target:target};
  opt.delimiter = delimiter || this.options.delimiter;
  return this.pathFinder(address, false, opt, callback);
};




/*
options:{
  delimiter: String - default "."
}

*/

