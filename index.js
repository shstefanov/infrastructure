var fs      = require("fs");
var path    = require("path");
var _       = require("underscore");

var init    = require("./init");
var helpers = require("./lib/helpers");

var loadApp = function(rootDir, config, options, cb){
  config.rootDir = rootDir;
  init(_.extend({config: config, helpers: helpers}, options), cb);
};

var hasConfig = function(folderPath){
  return fs.existsSync(path.join(folderPath, "config")) || fs.existsSync(path.join(folderPath, "config.js"))
};

var getConfig = function(folderPath){
  var configPath = path.join(folderPath, "config"), config;
  if(fs.statSync(configPath).isDirectory()){

    var YAML              = require('yamljs');
    var bulk              = require('bulk-require');

    require.extensions['.yml'] = function(module, filename) {
      var yaml_string     = fs.readFileSync(filename, 'utf8').toString();
      module.exports      = YAML.parse(yaml_string);
    };

    config = bulk(configPath, ['**/*.js','**/*.json', '**/*.yml']);
  }
  else{
    config = require(path.join(folderPath, "config"));
  }
  helpers.deepExtend(config, config.development || {});
  delete config.development;
  return config;
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
