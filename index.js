
var fs   = require("fs");
var path = require("path");
var _    = require("underscore");

var init = require("./init");

var loadApp = function(rootDir, config, options, cb){
  config.rootDir = rootDir;
  init(_.extend({config: config}, options), cb);
};

var hasConfig = function(folderPath){
  return fs.existsSync(path.join(folderPath, "config")) || fs.existsSync(path.join(folderPath, "config.js"))
};

var getConfig = function(folderPath){
  return require(path.join(folderPath, "config"));
};

module.exports = function findApp(folderPath, options, cb){
  folderPath = folderPath||process.argv[2]||process.cwd();
  options = options||{};
  if(hasConfig(folderPath))    loadApp(folderPath, getConfig(folderPath), options || {}, cb);
  else{
    console.log("config not found");
    console.log("try to find multiple apps in folder: TODO");
  }
};
