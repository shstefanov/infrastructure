

module.exports = (models, cb)->
  if !models
    cb()  
    return



  backbone_schemas = _.map models, (schema)->
    backbone_schema = 
      defaults:{}
      __name: schema.__name
      validate: (attrs)->
        #Validate something here based on schema and return error if any
        return undefined

    
    backbone_schema.defaults[key] = undefined for key, val of schema

    App.Models[schema.__name] = App.Model
    .extend(require("../base/extendedModel.coffee"))
    .extend backbone_schema
    
    backbone_collection = 
      __name: schema.__name
      model: App.Models[schema.__name]

    App.Collections[schema.__name] = App.Collection
    .extend(require("../base/extendedCollection.coffee"))
    .extend backbone_collection

  cb()

