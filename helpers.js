var fs = require("fs");
var _ = require("underscore");

module.exports.loadDirAsArray = function(dir){
  return _.filter(_.map(fs.readdirSync(dir), function(filename){
    var module = filename.split(".").pop() == "js"? require(dir+"/"+filename) : false;
    if(typeof module == "object") module._filename = filename;
    return module;
  }), function(module){return module;});
};

module.exports.loadDirAsObject = function(dir){
  var obj = {};
  var modules =  _.each(fs.readdirSync(dir), function(filename){
    var name = filename.split(".");
    name.pop();
    obj[name[0]] = name.length? require(dir+"/"+name[0]) : false;
    if(typeof module == "object") module._filename = filename;
  });
  return obj;
};
