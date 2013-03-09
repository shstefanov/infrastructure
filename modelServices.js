var Service = require("./service.js");
var _ = require("underscore");

// new Service({
//  name: serviceName,
//  methods: services[serviceName],
//  socket: socket,
//  session: session,
//  app: app
// });

function capitaliseFirstLetter(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var AttributeTypes = {
  STRING: "STRING",  
  TEXT: "TEXT",    
  INTEGER: "INTEGER", 
  DATE: "DATE",    
  BOOLEAN: "BOOLEAN", 
  FLOAT: "FLOAT"
};

module.exports = function(app, socket, session){




var DefineService = function(definition){

  var service = {
    name:definition.name, 
    modelDefinition:definition

  };
  
  var getRelation = function(rel){
    
    service["get"+rel] = function(data){
      var self = this;
      
      app.models[service.name].find(data.body.id)
      .error(function(err){
        self.emit({
          action: "get"+rel,
          body: err,
          meta:   "error",
          reqId: data.reqId
        });
      })
      .success(function(model){
        //Get the related model
        model["get"+rel](data.body.models).error(function(err){
          self.emit({
            action: "get"+rel,
            body: err,
            meta:   "error",
            reqId: data.reqId
          });
        })
        .success(function(relModel){
          self.emit({
            action: "get"+rel,
            body: relModel,
            meta:   "success",
            reqId: data.reqId
          });
        });
      });
    }
  };

  var setRelation = function(rel){
    
    service["set"+rel] = function(data){
      var self = this;
      var error = function(message){
        self.emit({
          action: "set"+rel,
          body: message,
          meta:   "error",
          reqId: data.reqId
        });
      };
      var success = function(message){
        self.emit({
          action: "set"+rel,
          body: message,
          meta:   "success",
          reqId: data.reqId
        });
      };

      app.models[self.name].find(data.body.id)
      .error(function(err){
        error(err);
      }).success(function(model){
        app.models[data.body.relatedModelName].find(data.body.id)
        .error(function(err){
          error(err);
        })
        .success(function(mo){
          model["set"+rel](mo)
          .error(function(err){
            error(err);
          })
          .success(function(dbData){
            success(dbData);
          });
        });
      });
    }
  };

  var removeRelation = function(rel){

    service["remove"+rel] = function(data){

      var self = this;
      var error = function(message){
        self.emit({
          action: "remove"+rel,
          body: message,
          meta:   "error",
          reqId: data.reqId
        });
      };
      var success = function(message){
        self.emit({
          action: "remove"+rel,
          body: message,
          meta:   "success",
          reqId: data.reqId
        });
      };

      app.models[self.name].find(data.body.id)
      .error(function(err){
        error(err);
      }).success(function(model){
        app.models[data.body.relatedModelName].find(data.body.id)
        .error(function(err){
          error(err);
        })
        .success(function(mo){
          model["remove"+rel](mo)
          .error(function(err){
            error(err);
          })
          .success(function(dbData){
            success(dbData);
          });
        });
      });
    }
  };

  var removeRelations = function(rel){
    
    service["remove"+rel] = function(data){
      
      var self = this;
      var error = function(message){
        self.emit({
          action: "remove"+rel,
          body: message,
          meta:   "error",
          reqId: data.reqId
        });
      };
      var success = function(message){
        self.emit({
          action: "remove"+rel,
          body: message,
          meta:   "success",
          reqId: data.reqId
        });
      };

      var relModels = typeof data.body.models == "array"?
        _.pluck(data.body, "id") : [data.body.model.id];

      app.models[self.name].find(data.body.id)
      .error(function(err){
        error(err);
      }).success(function(model){



        var counter = relModels.length;
        var errors = [];

        relModels.forEach(function(id){
          app.models[data.body.relatedModelName].find(id)
          .error(function(err){
            error(err);
          })
          .success(function(rel_model){
            model["remove"+rel](rel_model)
            .error(function(err){
              counter--;
              errors.push(err);
              if(counter-errors.length ==0)
                if(errors.length == 0) success(true)
                else error(errors);
            })
            .success(function(dbData){
              counter--
              if(counter-errors.length ==0)
                if(errors.length == 0) success(true)
                else error(errors);
            });
          });
        });
      });
    }
  };

  var addRelations = function(rel){
    
    service["add"+rel] = function(data){
      
      var self = this;
      var error = function(message){
        self.emit({
          action: "add"+rel,
          body: message,
          meta:   "error",
          reqId: data.reqId
        });
      };
      var success = function(message){
        self.emit({
          action: "add"+rel,
          body: message,
          meta:   "success",
          reqId: data.reqId
        });
      };

      var relModels = _.pluck(data.body.models, "id");

      app.models[self.name].find(data.body.id)
      .error(function(err){
        error(err);
      }).success(function(model){

        var counter = relModels.length;
        var errors = [];

        relModels.forEach(function(id){
          app.models[data.body.relatedModelName].find(id)
          .error(function(err){
            error(err);
          })
          .success(function(rel_model){
            model["add"+rel](rel_model)
            .error(function(err){
              counter--;
              errors.push(err);
              if(counter-errors.length ==0)
                if(errors.length == 0) success(true)
                else error(errors);
            })
            .success(function(dbData){
              counter--
              if(counter-errors.length ==0)
                if(errors.length == 0) success(true)
                else error(errors);
            });
          });
        });
      });
    }
  };
  
  if(definition.hasOne){
    for(rel in definition.relations.hasOne){
      
      getRelation(capitaliseFirstLetter(rel));
      setRelation(capitaliseFirstLetter(rel));
      removeRelation(capitaliseFirstLetter(rel));
    }
  }
  if(definition.hasMany){
    
    for(rel in definition.relations.hasMany){
      
      getRelation(capitaliseFirstLetter(rel));
      addRelations(capitaliseFirstLetter(rel));
      removeRelations(capitaliseFirstLetter(rel));
    }
  }
  if(definition.belongsTo){
    for(rel in definition.relations.belongsTo){
      
      getRelation(capitaliseFirstLetter(rel));
    }
  }

  service.find = function(data){
    var self = this;
    
    app.models[this.name].findAll(data.body)
    .error(function(err){
      self.emit({
        action: "new",
        body: err,
        meta:   "error",
        reqId: data.reqId
      });
    })
    .success(function(dbData){
      self.emit({
        action: "new",
        body: dbData,
        meta:   "success",
        reqId: data.reqId
      });
    });
  };

  service.new = function(data){
    var self = this;
    app.models[this.name].create(data.body)
    .error(function(err){
      self.emit({
        action: "new",
        body: err,
        meta:   "error",
        reqId: data.reqId
      });
    })
    .success(function(dbData){
      self.emit({
        action: "new",
        body: dbData,
        meta:   "success",
        reqId: data.reqId
      });
    });
  };

  service.get = function(data){
    var self = this;
    if(!data.body.id || typeof data.body.id != "number"){
      self.emit({
        action: "get",
        body: "Can't get model without id",
        meta:   "error",
        reqId: data.reqId
      });
      return;
    }
    app.models[this.name].find(data.body.id)
    .error(function(err){
      self.emit({
        action: "get",
        body: err,
        meta:   "error",
        reqId: data.reqId
      });
    })
    .success(function(dbData){
      self.emit({
        action: "get",
        body: dbData,
        meta:   "success",
        reqId: data.reqId
      });
    });
  };

  service.destroy = function(data){
    var self = this;
    if(!data.body.id || typeof data.body.id != "number"){
      self.emit({
        action: "get",
        body: "Can't destroy model without id",
        meta:   "error",
        reqId: data.reqId
      });
      return;
    }
    app.models[this.name].find(data.body.id)
    .error(function(err){
      self.emit({
        action: "destroy",
        body: err,
        meta:   "error",
        reqId: data.reqId
      });
    }).success(function(model){
      model.destroy()
      .error(function(err){
        self.emit({
          action: "destroy",
          body: err,
          meta:   "error",
          reqId: data.reqId
        });
      })
      .success(function(dbData){
        self.emit({
          action: "destroy",
          body: dbData,
          meta:   "success",
          reqId: data.reqId
        });
      });
    });
  };

  service.set = function(data){
    var self = this;
    if(!data.body.id || typeof data.body.id != "number"){
      self.emit({
        action: "get",
        body: "Can't update model without id",
        meta:   "error",
        reqId: data.reqId
      });
      return;
    }
    app.models[this.name].find(data.body.id)
    .error(function(err){
      self.emit({
        action: "set",
        body: err,
        meta:   "error",
        reqId: data.reqId
      });
    })
    .success(function(model){
      model.updateAttributes(data.body)
      .error(function(err){
        self.emit({
          action: "set",
          body: err,
          meta:   "error",
          reqId: data.reqId
        });
      }).success(function(dbData){
        self.emit({
          action: "set",
          body: dbData,
          meta:   "success",
          reqId: data.reqId
        });
      });
    });
  };

  new Service({
    name:definition.name,
    methods: service,
    app:app,
    socket:socket,
    session:session
  });
  
};

var serevicesBuilder = function(modelsHash){
  for (modelName in modelsHash){
    DefineService(modelsHash[modelName]);
  }
};





  var enabledServices = session.enabledModelsServices;
  var modelsDefinition = require(app.config.models);

  var dbArgument = {
    define: function(name, fields, options){
      
      addRelation = function(context, relType, relName, relatedModelName){
        if(!context.relations[ relType])
          context.relations[ relType] = {};
        context.relations[ relType][relName] = relatedModelName;
      };

      var model =  { //This is modelWrapper
        name:name,
        fields:fields,
        relations: {},

        hasMany: function(modelWrapper, relation){
          addRelation(this, "hasMany", relation.as, modelWrapper.name);
        },
        hasOne: function(modelWrapper, relation){
          addRelation(this, "hasOne", relation.as, modelWrapper.name);
        },
        belongsTo: function(modelWrapper, relation){
          addRelation(this, "belongsTo", relation.as, modelWrapper.name);
        }
      };
      return model;
    }
  };

  if(typeof modelsDefinition == "function"){
    modelsDefinition(dbArgument, AttributeTypes, function(serviceWrappersHash){
      var modelDefinitions = {};
      for(model in serviceWrappersHash){
        modelDefinitions[model] = serviceWrappersHash[model];
      }
      serevicesBuilder(modelDefinitions);
    });
  }
  else{
    serevicesBuilder(modelsDefinition);
  }
};
