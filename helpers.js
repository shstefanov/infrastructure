var fs = require("fs");
var _ = require("underscore");

module.exports.loadDirAsArray = function(dir){
  return _.filter(_.map(fs.readdirSync(__dirname+"/"+dir), function(filename){
    var module = filename.split(".").pop() == "js"? require(dir+"/"+filename) : false;
    if(typeof module == "object") module._filename = filename;
    return module;
  }), function(module){return module;});
};
