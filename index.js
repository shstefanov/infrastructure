var fs      = require("fs");
var path    = require("path");
var _       = require("underscore");

var cluster = require("cluster");

var helpers = require("./lib/helpers");


if(cluster.isWorker && process.env.INFRASTRUCTURE_AUTOLOAD){
  var now = Date.now();
  require("./init.js")({ 
    config: JSON.parse(process.env.INFRASTRUCTURE_CONFIG),
    helpers: helpers 
  }, function(err, env){
    if(err) throw err;
    env.i.do("log.sys", "worker started", (Date.now() - now) +"ms, structures: "+Object.keys(env.config.structures).join(","));
  });
}
else{

  var argv = require('minimist')(process.argv.slice(2), {boolean: true});
  var cli_config = argv.config;
  module.exports = function findApp( config, cb ){
    var now = Date.now();
    if( cluster.isWorker ) return module.exports.init({ 
      config: JSON.parse(process.env.INFRASTRUCTURE_CONFIG),
      helpers: helpers 
    }, cb);
    else{
      cluster.setupMaster({exec: __filename});
    }

    // Keep original config untouched
    config = JSON.parse(JSON.stringify(config));
    //if( !config.mode         ) config.mode         = "development"; // development is default mode
    if( !config.process_mode ) config.process_mode = "single";      // single is default process_mode
    if( !config.rootDir      ) config.rootDir      = process.cwd(); // process.cwd() is default rootDir
    loadApp( extendConfig( config ), function(err, env){
      if(err) return cb(err);
      env.i.do("log.sys", "application started", (Date.now() - now) +"ms, process_mode: "+env.config.process_mode +", application mode: "+env.config.mode);
      cb(null, env);
    });
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

  var loadConfig = module.exports.loadConfig = function(configPath, app_config){
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

    if(app_config.mode) config.mode = app_config.mode;
    config = JSON.parse(JSON.stringify(config)); // this will keep modules untouched

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
    var isMaster = cluster.isMaster;

    // Workers will get their from process.env
    if( config.process_mode === "cluster" && !isMaster ) return config;
    var extension      = module.exports.loadConfig(module.exports.getConfigPath(config.rootDir), config);

    var mode_extension;
    if(config.mode){
      mode_extension = extension[config.mode];
      delete extension[config.mode]
    } 

    if(mode_extension){
      helpers.deepExtend( extension, mode_extension );
    }
    helpers.deepExtend(config, extension);

    if(cli_config) helpers.deepExtend(config, cli_config);

    return config;
  };

}


