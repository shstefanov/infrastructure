var helpers = require("./helpers");
var _ = require("underscore");

module.exports = function(mongoose, config, app){

  var Schema = mongoose.Schema;
  var models = helpers.loadDirAsObject(config.modelsFolder);
  //console.log(models);

  var defined = {}; //{name:prototype}
  var schemas = {};
  
  //Declare all models
  for(key in models){
    schemas[key] = new Schema();
    
    console.log("registering schema and model:", key);
  }
    
  for(key in models){
    //building schemas
    var schema = {};
    var model = models[key];

    for(prop in model){
      var value = _.isArray(model[prop])? model[prop][0] : model[prop];
      
      if(typeof value === "string" && models[value]){ //there is such model
        schema[prop] = _.isArray(model[prop])? [schemas[value]] : schemas[value];
        //console.log("creating propertie in",key, "propertie name:", prop, "new propertie value: ", schema[prop]);
      }
      else{
        schema[prop] = value;
      }
    }
  }

  //So, all models schemas must be created, creating models
  for (key in schemas){
    console.log("|");
    console.log("creating model: ", key);
    defined[key] = mongoose.model(key, schemas[key]);
  }

  return {
    defined:defined,
    models:models
  }
};

