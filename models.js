var helpers = require("./helpers");


module.exports = function(mongoose, config){
  var models = helpers.loadDirAsArray(config.modelsFolder, function(model){
    
  });

};
