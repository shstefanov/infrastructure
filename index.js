var fs      = require("fs");
var path    = require("path");
var _       = require("underscore");

// var init    = require("./init");
var helpers = require("./lib/helpers");


module.exports = function findApp( config, cb ){
  // Keep original config untouched
  config = JSON.parse(JSON.stringify(config));
  if( !config.mode         ) config.mode         = "development"; // development is default mode
  if( !config.process_mode ) config.process_mode = "single";      // single is default process_mode
  if( !config.rootDir      ) config.rootDir      = process.cwd(); // process.cwd() is default rootDir
  loadApp( extendConfig( config ), cb );
};

var init = module.exports.init = require("./init");

var loadApp = module.exports.loadApp = function( config, cb ){
  // Creating the env object
  module.exports.init({ config: config, helpers: helpers }, cb);
};

var hasConfig = module.exports.hasConfig = function( rootDir ){
  return      fs.existsSync(path.join(rootDir, "config"       )) 
          ||  fs.existsSync(path.join(rootDir, "config.js"    ))
          ||  fs.existsSync(path.join(rootDir, "config.json"  ))
          ||  fs.existsSync(path.join(rootDir, "config.yml"   ));
};

var loadConfig = module.exports.loadConfig = function(configPath){
  var config;
  if(fs.statSync(configPath).isDirectory()){

    var YAML              = require('yamljs');
    var bulk              = require('bulk-require');

    require.extensions['.yml'] = function(module, filename) {
      var yaml_string     = fs.readFileSync(filename, 'utf8').toString();
      module.exports      = YAML.parse(yaml_string);
    };

    config = bulk(configPath, ['**/*.js','**/*.json', '**/*.yml']);
  }
  else if(configPath.split(".").pop() === "yml"){
    config = require('yamljs').parse(fs.readFileSync(configPath, 'utf8').toString());
  }
  else{
    config = require(configPath);
  }
  // Create a clone of config in order to eep original modules untouched
  config = JSON.parse(JSON.stringify(config));
  return config
}

var getConfigPath = module.exports.getConfigPath = function(rootDir){
  return  ( fs.existsSync(path.join(rootDir, "config"       )) ? path.join(rootDir, "config"      ) : false )
      ||  ( fs.existsSync(path.join(rootDir, "config.js"    )) ? path.join(rootDir, "config.js"   ) : false )
      ||  ( fs.existsSync(path.join(rootDir, "config.json"  )) ? path.join(rootDir, "config.json" ) : false )
      ||  ( fs.existsSync(path.join(rootDir, "config.yml"   )) ? path.join(rootDir, "config.yml"  ) : false )
}

var extendConfig = module.exports.extendConfig = function( config ){
  if( !hasConfig(config.rootDir) ) return config; // Nothing to extend
  var isMaster = require("cluster").isMaster;

  // Workers will get their configs later
  if( config.process_mode === "cluster" && !isMaster ) return config;
  var extension      = module.exports.loadConfig(module.exports.getConfigPath(config.rootDir));
  var mode_extension =  ( config.mode === "development") ? ( extension.development ) :
                        ( config.mode === "test"       ) ? ( extension.test        ) : null;
  
  delete extension.development;
  delete extension.test;
  
  if(mode_extension){
    helpers.deepExtend( extension, mode_extension );
  }
  helpers.deepExtend(config, extension);
  return config;
};


