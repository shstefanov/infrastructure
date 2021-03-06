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
    if(env.config.options.repl && typeof env.config.options.repl === "string" && env.config.structures.hasOwnProperty(env.config.options.repl)){
      var repl = require("repl");
      var replServer = repl.start({ prompt: "infrastructure."+env.config.options.repl+" > " });
      replServer.context.env = env;
      replServer.context.config = env.config;
      env.stops.push(function(cb){ replServer.close(); cb(); });
    }
  });
}
else{

  var argv = require('minimist')(process.argv.slice(2), {boolean: true});
  var cli_config = argv.config;
  var cli_options = _.omit(argv, ["config"]);
  module.exports = function findApp( config, cb ){
    var now = Date.now();
    if( cluster.isWorker ) return module.exports.init({ 
      config: JSON.parse(process.env.INFRASTRUCTURE_CONFIG),
      helpers: helpers 
    }, cb);
    else{
      cluster.setupMaster({exec: __filename});
    }

    if(cli_options.mode) config.mode = cli_options.mode;
    if(cli_options.process_mode) config.mode = cli_options.process_mode;

    // Keep original config untouched
    config = JSON.parse(JSON.stringify(config));
    //if( !config.mode         ) config.mode         = "development"; // development is default mode
    if( !config.process_mode ) config.process_mode = "single";      // single is default process_mode
    if( !config.rootDir      ) config.rootDir      = process.cwd(); // process.cwd() is default rootDir
    loadApp( extendConfig( config ), function(err, env){
      if(err) return cb(err);
      env.i.do("log.sys", "application started", (Date.now() - now) +"ms, process_mode: "+env.config.process_mode +", application mode: "+env.config.mode);
      if(cli_options.repl && cli_options.repl === true){
        var repl = require("repl");
        var replServer = repl.start({ prompt: "infrastructure > " });
        replServer.context.env = env;
        replServer.context.config = env.config;
        replServer.context.restart = function(name){
          env.i.do([name, "__run", "stop"].join("."), console.log );
        };
        env.stops.push(function(cb){ replServer.close(); cb(); });
      }
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
            ||  fs.existsSync(path.join(rootDir, "config.hson"  ))
            ||  fs.existsSync(path.join(rootDir, "config.yml"   ));
  };

  var loadConfig = module.exports.loadConfig = function(configPath, app_config){
    var config;
    
    require.extensions['.yml'] = function(module, filename) {
      var yaml_string     = fs.readFileSync(filename, 'utf8').toString();
      module.exports      = require('yamljs').parse(yaml_string); // something like lazy loading
    };

    require.extensions['.hson'] = function(module, filename) {
      var hson_string     = fs.readFileSync(filename, 'utf8').toString();
      module.exports      = require('hanson').parse(hson_string); // something like lazy loading
    };

    if(fs.statSync(configPath).isDirectory()){
      var bulk              = require('bulk-require');
      config = bulk(configPath, ['**/*.js', '**/*.json', '**/*.hson', '**/*.yml']);
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
        ||  ( fs.existsSync(path.join(rootDir, "config.hson"  )) ? path.join(rootDir, "config.hson" ) : false )
        ||  ( fs.existsSync(path.join(rootDir, "config.yml"   )) ? path.join(rootDir, "config.yml"  ) : false )
  }

  var extendConfig = module.exports.extendConfig = function( config ){
    if( !hasConfig(config.rootDir) ) {
      if(cli_config) helpers.deepExtend(config, cli_config);
      helpers.deepExtend(config, {options: cli_options});
      return config;
    }
    var isMaster = cluster.isMaster;

    // Workers will get their from process.env
    if( config.process_mode === "cluster" && !isMaster ) return config;
    var extension      = module.exports.loadConfig(module.exports.getConfigPath(config.rootDir), config);

    var mode_name = cli_options.mode || config.mode || extension.mode, mode_extension;
    if(mode_name){
      if(config[mode_name]) {
        mode_extension = config[mode_name];
        delete extension[config.mode];
      }
      else if(extension[mode_name]) {
        mode_extension = extension[mode_name];
        delete extension[extension.mode];
      }
    } 

    if(mode_extension){
      helpers.deepExtend( extension, mode_extension );
    }
    helpers.deepExtend(config, extension);


    if(cli_config) helpers.deepExtend(config, cli_config);

    // Reduce structures for test needs

    helpers.deepExtend(config, {options: cli_options});

    //using 'patch'
    if(config.patch){
      for(var target in config.patch){
        helpers.patch(config, target, config.patch[target]);
      }
      delete config.patch;
    }
    
    if(config.only){
      if(typeof config.only === "string") config.only = config.only.split(",");
      config.structures = _.pick(config.structures, config.only);
    }

    return config;
  };

}


