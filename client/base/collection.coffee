
module.exports = 

  fire: ->
    model.trigger.apply(model, arguments) for model in @models

  bindAll: (event, method, context)->
    bindModel = (model)=>
      model.on.call model, event, method, (context || model)
    unbindModel = (model)=>
      model.off.call model, event, method, (context || model)
    bindModel(model) for model in @models
      
    @on "add", bindModel
    @on "remove", unbindModel
    @on "reset", (collection)=> 
      @each bindModel
  
  unbindAll: ->
    model.off.apply model, arguments for model in @models
    @

  fetch: ->
    @
  
       




