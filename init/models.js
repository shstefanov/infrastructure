
var path = require("path");
var fs = require("fs");
var _ = require("underscore");

var ModelFactory = require("../lib/ModelFactory");

module.exports = function(cb){
  var env = this;
  var config = env.config;
  if(!config.models || !fs.existsSync(path.join(config.rootDir, config.models))) return cb();
  

  var modelsDir = path.join(config.rootDir, config.models);

  //////////////////////////////////////
  // this._.debug(null, 1, "red", "MODELS");
  //////////////////////////////////////

  env.models = {
    server: {},
    shared: {}
  };

  var num = 0;

  this._.mapObject( env.models, function(folderName, target ){
    var destFolder = path.join(modelsDir, folderName);
    var modelsFileNames = _
    .filter(fs.readdirSync(destFolder), function(filename){
      return filename.indexOf(config.avoidLoading || "_") !== 0 || !fs.statSync(path.join(destFolder, filename)).isDirectory();
    })
    .map(function(file){
      num++;
      return path.join(destFolder, file);
    });
    
    _.each(modelsFileNames, function(filepath){
      var model;
      var modelName = filepath.replace(/(\.js|.coffee)$/, "").split(/(\\|\/)/).pop();
      var def = require(path.join(filepath));
      ModelFactory(modelName, def, env, function(err, Model){
        if(err) return cb(err);

        // Ok - we have models here - now stick shared and server classes together

        num--;
        target[modelName] = Model;
        if(num === 0) {
          cb();
        }
      });

    });
    return target;
  });

  if(num == 0) cb();

};