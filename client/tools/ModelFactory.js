//typeof operator checks for “number”, 
//“string”, “boolean”, “undefined”, 
//“function”, and “object”

// Sequelize.STRING  ===> VARCHAR(255)
// Sequelize.TEXT    ===> TEXT
// Sequelize.INTEGER ===> INTEGER
// Sequelize.DATE    ===> DATETIME
// Sequelize.BOOLEAN ===> TINYINT(1)
// Sequelize.FLOAT   ===> FLOAT
function capitaliseFirstLetter(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var allowedTypes = {
  "STRING" : "string",
  "INTEGER" : "number",
  "boolean": "boolean"
};


var hasOneInitialize = function(options){
  var self = this;
  Object.keys(this.hasOne).forEach(function(relName){
    var relatedModelName = self.hasOne[relName];
    ["get", "set", "remove"].forEach(function(m){
      self[m+capitaliseFirstLetter(relName)] = function(model, callback){
        
        if(!self[relName])
          self[relName] = new App.Models[capitaliseFirstLetter(relatedModelName)](data);

        if(typeof model == "function"){var md = {}, cb = model;}
        else{
          if(typeof md.attributes == "object"){var md = model.toJSON();}
          else {var md = model;}
          var cb=callback;
        }

        app.services[self.name][m+capitaliseFirstLetter(relName)]({id:self.id, model:md}, function(err, data){
          if(err) {
            cb(err); 
            return;
          }
          if(data == null) {
            self[relName] = null; 
            cb(null, null); 
            return;
          }
          if(self[relName] && self[relName].id == data.id) {
            self[relName].set(data); 
            cb(null, self[relName]); 
            return;
          }
          self[relName].set(data);
          cb(null, self[relName]); 
        });
      };
    });
  });
};

var hasManyInitialize = function(options){

  var self = this;
  Object.keys(this.hasMany).forEach(function(relName){
    var relatedModelName = self.hasMany[relName];

    ["get", "add", "remove"].forEach(function(m){
      self[m+capitaliseFirstLetter(relName)] = function(arrayModelOrCollection, callback){

        if(!self[relName]) 
          self[relName] = new App.Collections[relatedModelName]({ref:self});
        var relatedCollection = self[relName];

        if(typeof arrayModelOrCollection == "function"){console.log("---------1");var models = [], cb = arrayModelOrCollection;}
        else{console.log("---------2");
          var cb=callback;
          if(typeof arrayModelOrCollection.models == "array"){console.log("---------3"); //It is a collection
            var models = arrayModelOrCollection.toJSON();
          }
          else if(typeof arrayModelOrCollection.attributes == "object"){console.log("---------4"); //It is single model
            var models = [arrayModelOrCollection.toJSON()];
          }
          else if (typeof arrayModelOrCollection == "array"){console.log("---------5"); //It is array of models
            if(arrayModelOrCollection.length > 0 && typeof arrayModelOrCollection[0].attributes == "object"){console.log("---------")
              var models = _.pluck(arrayModelOrCollection, "attributes");
            }
            else{console.log("---------6"); //It's just array with json data
              var models = arrayModelOrCollection;
            }
          }
        }
        
        app.services[self.name][m+capitaliseFirstLetter(relName)]({
          id:self.id, 
          models:models, //ill be also and pattern
          relatedModelName:relatedModelName
        }, function(err, data){ //Expecting data to be array
          if(err) {
            cb(err); 
            return;
          }

          switch(m){

            case "get":
              relatedCollection.add(data);
              cb(null, relatedCollection);
              break;

            case "add":
              relatedCollection.add(data, {merge: true});
              cb(null, relatedCollection);
              break;

            case "remove":
              relatedCollection.remove(data);
              cb(null, relatedCollection);
              break;

            default:
              alert("See the console!");
              console.log("Something is wrong here!");
          }
        });
      };
    });
  })
};

var belongsToInitialize = function(options){
  var self = this;
  Object.keys(this.belongsTo).forEach(function(relName){
    var relatedModelName = self.belongsTo[relName];
    self["get"+capitaliseFirstLetter(relName)] = function(model, cb){
      if(!self[relName])
        self[relName] = new App.Models[relatedModelName]({ref:self});
      app.services[self.name]["get"+capitaliseFirstLetter(relName)]({id:self.id}, function(err, data){
        if(err) {
          cb(err); 
          return;
        }
        self[relName].set(data);
        cb(null, self[relName]);
      });
    };
  });
};

var CRUDinitialize = function(){

};

var BaseModel = App.Model.extend({
  initialize: function(options){
    if(this.hasOne)    {  hasOneInitialize.apply    (this, arguments);  }
    if(this.hasMany)   {  hasManyInitialize.apply   (this, arguments);  }
    if(this.belongsTo) {  belongsToInitialize.apply (this, arguments);  }
  }
});

var BaseCollection = Backbone.Collection.extend({

});

var attrAnalizer = function(name, fields, options){

  var attributeTypes = {};
  var defaults = {};

  for(attr in fields){
    attributeTypes[attr] = fields[attr];
    defaults[attr] = App.defaultMissingAttributeValue;
  }

  var ModelHash = {
    name: name,
    idAttribute: "id",
    defaults: defaults,
    attributeTypes: attributeTypes, //Think about making validators class property
  };
  return ModelHash;
};

var modelBuilder = function(modelWrappersHash){
  console.log(modelWrappersHash);
  for(model in modelWrappersHash){
    modelData = modelWrappersHash[model].modelHash;
    console.log(modelData.name);
    modelData.service = app.services[modelData.name];
    App.Models[capitaliseFirstLetter(modelData.name)] = BaseModel.extend(modelData);
    App.Collections[capitaliseFirstLetter(modelData.name)] = BaseCollection.extend({
      model: App.Models[modelData.name]
    });
    app.collections[modelData.name] = new App.Collections[capitaliseFirstLetter(modelData.name)]();
  }

};


var AttributeTypes = App.AttributeTypes = {
  STRING: "STRING",  
  TEXT: "TEXT",    
  INTEGER: "INTEGER", 
  DATE: "DATE",    
  BOOLEAN: "BOOLEAN", 
  FLOAT: "FLOAT"
};


//Return modelBuilder function if modelsHash is 
//prepended instead of entire models define function
module.exports = function(models){
  var dbArgument = {
    define: function(name, fields, options){
      modelHash = attrAnalizer(name, fields, options);

      addRelation = function(context, relType, relName, relatedModelName){
        if(!context.modelHash[relType])
          context.modelHash[relType] = {};
        context.modelHash[relType][relName] = relatedModelName;
      };

      return { //This is modelWrapper
        name:name,
        modelHash:modelHash,

        hasMany: function(modelWrapper, relation){
          addRelation(this, "hasMany", relation.as, modelWrapper.name)
        },
        hasOne: function(modelWrapper, relation){
          addRelation(this, "hasOne", relation.as, modelWrapper.name)
        },
        belongsTo: function(modelWrapper, relation){
          addRelation(this, "belongsTo", relation.as, modelWrapper.name)
        }
      };
    }
  };

  if(typeof models == "function"){
    models(dbArgument, AttributeTypes, function(modelWrappersHash){
      modelBuilder(modelWrappersHash);
    });
  }
  else{
    modelBuilder(models);
  }
};
