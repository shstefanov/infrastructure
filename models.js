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
    defined[key] = mongoose.model(key, schemas[key]);
    console.log("registering schema and model:", key);
  }
    
  for(key in models){
    //building schemas
    var schema = {};
    var model = models[key];
    for(prop in model){
      var value = _.isArray(model[prop])? model[prop][0] : model[prop];
      console.log("analizing propertie: ", prop, value);
      if(typeof value === "string" && models[value]){ //there is such model
        console.log("found model: ", value);
        schema[prop] = _.isArray(model[prop])? [schemas[value]] : schemas[value];
        console.log("propertie: ", prop, "is", schemas[value]);
      }
      else{
        schema[prop] = value;
      }
      schemas[key].add(schema);
    }
  }



};

