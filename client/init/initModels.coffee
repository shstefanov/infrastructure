


module.exports = (models, cb)->
  if !models
    cb()  
    return

  counter = models.length

  send = (data, options)->
    app.services.models.exec data, (err, res)->
      if err 
        options.error err
      else
        options.success res


  create = (model, options)->
    send {action:"create",name:model.__name,data:model}, options

  update = (model, options)->
    send {action:"update",name:model.__name,data:model}, options

  remove = (model, options)->
    send {action:"delete",name:model.__name,data:{ id: model.id }}, options
    
  read = (model, options)->
    send {action:"read",name:model.__name,data:{ id: model.id }}, options

  Backbone.sync = (method, model, options)->
    options || (options = {})
    switch method
      when 'create' then create model, options
      when 'update' then update model, options
      when 'delete' then remove model, options
      when 'read'   then   read model, options







  backbone_schemas = _.map models, (schema)->
    backbone_schema = {defaults:{}}
    for key, val of schema
      backbone_schema.defaults[key] = undefined
      backbone_schema.__name = schema.__name
      

      backbone_schema.save = (data)->


  cb()

