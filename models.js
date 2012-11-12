

var helpers = require("./helpers");


module.exports = function(mongoose, config, app){

  var Schema = mongoose.Schema;
  var models = helpers.loadDirAsObject(config.modelsFolder);

  var defined = {}; "//{name:prototype}"
  var notDefined = [];
  var createModel = function(name, schema){
    
   

    //Check if there is model relation in the schema
    for (key in schema){
      var isArray = typeof schema[key] === "array";
      var value = isArray? schema[key][0] : schema[key];
      var isString = typeof schema[key] === "string";
      var isModel = typeof models[value] === "object";
      var isDefined = typeof defined[schema[key]] === "function";

      if(isArray || isString){//We have a model relation
        if(isModel){
          if(isDefined){
            schema[key] = isArray? [defined[schema[key]]] : defined[schema[key]];
          }
          else{
            //The model is not defined - creating one
            //value must be string with model name
            schema[key] = createModel(value, models[value]);
          }
        }
        else{
          //Hmmm - is string or array, but is not model. What to do?
          throw new Error("No such model - ", schema[key]);
        }
      }
    }

    //Creating the schema
    var model = new Schema();
    model.add(schema);

    //Define the model
    mongoose.model(name, Model);
    defined[name] = model;

    //And if there are more undefined models - defined them
    if(notDefined.length){

    }
  };

  for(name in models)
    createModel(name, models[name]);
  

};