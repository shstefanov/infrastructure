var fs = require("fs");
var _ = require("underscore");
var walk = require("walk");

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

module.exports.loadFilenamesInDir = function(dir, callback){

  var files = fs.readdirSync(dir);
  files.forEach(function(file){
    var style = fs.readFileSync(dir+"/"+file, "utf8");
    callback(style);
  });
};

module.exports.plainTextContentWrapper = function(body, file){
  var prepend = "module.exports = \n";
  var line_beginning = "\"";
  var line_ending = "\"+\n";
  var append = ";\n";
  var lines = body.split("\n");
  var mod = _.map(lines, function(line){return line_beginning+line+line_ending;});
  var code = prepend+mod.join("")+append;
  code = code.replace("+\n;", ";");
  return code;
};

module.exports.loadDirTreeAsArray = function(dir, callback){
  var files = [];
  var walker  = walk.walk(dir, { followLinks: false });
  walker.on('file', function(root, stat, next) {
    file = (root+"/"+stat.name);
    files.push(file);
    next();
  });
  walker.on("end", function(){callback(files);});
};
