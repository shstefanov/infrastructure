
var fs   = require("fs");
var path = require("path");
var _    = require("underscore");
require("colors");

var init = require("./init");

var loadApp = function(rootDir, config, options){
  config.rootDir = rootDir;
  init(_.extend({config: config}, options), function(err){
    if(err) {
      console.log("ERROR::", err);
      throw err;
    }
  });
};

var hasConfig = function(folderPath){
  return fs.existsSync(path.join(folderPath, "config")) || fs.existsSync(path.join(folderPath, "config.js"))
};

var getConfig = function(folderPath){
  return require(path.join(folderPath, "config"));
};

module.exports = function findApp(folderPath, options){
  folderPath = folderPath||process.argv[2]||process.cwd();
  options = options||{};
  if(hasConfig(folderPath))    loadApp(folderPath, getConfig(folderPath), options || {});
  else{
    console.log("config not found");
    console.log("try to find multiple apps in folder: TODO");
  }
};