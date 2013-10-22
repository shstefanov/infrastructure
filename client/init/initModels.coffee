


module.exports = (models, cb)->
  if !models
    cb()  
    return

  create = (model, options)->
    app.services[model.__name].create {pattern:model.attributes}, (err, res)->
      if err 
        options.error err
      else
        options.success res
  update = (model, options)->
    app.services[model.__name].update {pattern:{_id:model.id}}, _.omit(model.attributes, "_id"),(err, res)->
      if err 
        options.error err
      else
        options.success res

  remove = (model, options)->
    app.services[model.__name].delete {pattern:{_id:model.id}}, (err, res)->
      if err 
        options.error err
      else
        options.success res
    
  read = (model, options)->
    app.services[model.__name].findOne {pattern:{_id:model.id}}, (err, res)->
      if err 
        options.error err
      else
        options.success res

  Backbone.sync = (method, model, options)->
    options || (options = {})
    switch method
      when 'create' then create model, options
      when 'update' then update model, options
      when 'delete' then remove model, options
      when 'read'   then   read model, options

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

