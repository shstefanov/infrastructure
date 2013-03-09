
module.exports = Backbone.Collection.extend

  fetch: (pattern, callback)->

    if(typeof pattern == "object" && typeof callback == "function")
      cb = callback
      pt = pattern
      if(pattern.id)
        pt.limit = 1;
    if(typeof pattern == "function")
      cb = pattern
      pt={}
    if(!pattern)
      pt={}

    @service.find pt, (err, models)=>
      if err 
        cb(err) if cb
        @trigger("error")
        return
      @reset(models)
      cb(null, @) if cb

  save: ->
    @each (model)=>
      if(model.notSaved)
        model.save (err, mod)=>
          if(err) 
            mod.trigger("error", err)
            return
          mod.notSaved = false
          mod.trigger("change")




