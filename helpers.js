var fs = require("fs");
var _ = require("underscore");
var walk = require("walk");


//Read all .js files in given directory and return array of required modules 
module.exports.loadDirAsArray = function(dir, callback){ //TBD - make callback and give the module to it
  return _.filter(_.map(fs.readdirSync(dir), function(filename){
    var module = filename.split(".").pop() == "js"? require(dir+"/"+filename) : false;
    if(typeof module == "object") module._filename = filename;
    return module;
  }), function(module){if(callback){callback(module);} return module;}); //Here will be the callback
};

//Read all .js files in given directory and return object of type {filename:module, ...} (without extensions)
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


//Reads all files in given directory and returns array with contents of files in text utf8 format
module.exports.loadFilenamesInDir = function(dir, callback){
  var files = fs.readdirSync(dir);
  files.forEach(function(file){
    var style = fs.readFileSync(dir+"/"+file, "utf8");
    callback(style);
  });
};

//Wraps text in the file and wraps lines to become walid javascript string object (to be used in browser)
module.exports.plainTextContentWrapper = function(body, file){
  var prepend = "module.exports = \n";
  var line_beginning = "\"";
  var line_ending = "\\n\"+\n";
  var append = ";\n";
  var lines = body.split("\n");
  var mod = _.map(lines, function(line){return line_beginning+line+line_ending;});
  var code = prepend+mod.join("")+append;
  code = code.replace("+\n;", ";");
  return code;
};

//Loads all filenames recursively and returns array with filepaths. Gives the result  to callback
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
