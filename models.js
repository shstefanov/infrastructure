var helpers = require("./helpers");
var _ = require("underscore");

//Called in index.js
module.exports = function(mongoose, config, app){

  var Schema = mongoose.Schema;
  var models = helpers.loadDirAsObject(config.modelsFolder);

  var defined = {}; //{name:prototype}
  var schemas = {};

  //Will be stringifyed when iterating over models
  var stringified = {};
  
  //Declare all models
  for(key in models){
    schemas[key] = new Schema();
  }
    

  for(key in models){
    var modelName = key;
    stringified[modelName] = {};
    //building schemas
    var schema = {};
    var model = models[modelName];

    for(prop in model){
      var propertieName = prop;
      var isArray = _.isArray(model[propertieName]);
      var value = isArray? model[propertieName][0] : model[propertieName];

      if(typeof value === "string" && models[value]){ //there is such model
        schema[propertieName] = _.isArray(model[propertieName])? [schemas[value]] : schemas[value];
        stringified[modelName][propertieName] = isArray? [value] : value;
      }

      else if (helpers.coreTypesStringify(value)) {//It is not defined model, so may be it's core type
        var typeString = helpers.coreTypesStringify(value);
        stringified[modelName][propertieName] = isArray? [typeString]: typeString;
      }

      else{
        schema[prop] = value;
        stringified[modelName][propertieName] = value;
      }
    }
  }

  //So, all models schemas must be created, creating models
  for (key in schemas)
    defined[key] = mongoose.model(key, schemas[key]);

  return {
    defined:defined,
    schemas:models,
    stringified:stringified
  }
};

