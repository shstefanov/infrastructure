
module.exports = Backbone.Collection.extend

  initialize: ->
    @off "all"

  bindAll: (event, method, context)->

    onCollectionEvent = (arg1, arg2, arg3)->
      console.log "collection event!!!"
      @off event, onCollectionEvent, @
      @each (model)-> model.trigger event, arg1, arg2, arg3
      @on event, onCollectionEvent, @
    @on event, onCollectionEvent, @
    bindModel = (model)=>
      model.on.call model, event, method, (context || model)
    unbindModel = (model)=>
      model.off.call model, event, method, (context || model)

    bindModel(model) for model in @models
      
    @on "add", bindModel
    @on "remove", unbindModel
    @on "reset", (collection)=> 
      collection.each bindModel
      @unbindAll('all')
    unbindEvent = "unbind_"+arguments[0]
    @on unbindEvent, =>
      @off unbindEvent
      @off "add", bindModel
      @off "remove", unbindModel
  
  unbindAll: ->
    @trigger "unbind_"+arguments[0] 
    @off.apply @, arguments
    model.off.apply model, arguments for model in @models
    @
  
       




