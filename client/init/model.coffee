
module.exports = Backbone.Model.extend
  save: (cb)->
    app.collections[@name].add(@, {merge:true})

    if (@id)
      app.services[@name].set @attributes, (err, data)=>
        if err
          @trigger("error", err)
          cb(err) if cb
          return
        @set(data,{silent:true})
        cb(null, @)  if cb
        @trigger("change")
      return
    app.services[@name].new @attributes, (err, data)=>
      if err
        @trigger("error", err)
        cb(err) if cb
        return
      @set(data,{silent:true})
      cb(null, @)  if cb
      @trigger("change")

  fetch: (id, cb)->
    i = @id || id.id || id
    if(!i)
      error = "Can't fetch model without id"
      cb(error)
      @trigger("error", error)
      return

    app.services[@name].get {id:i}, (err, data)=>
      if err
        @trigger("error", err)
        cb(err) if cb
        return
      @set(data)
      app.collections[@name].add(@, {merge:true})
      cb(null, @) if cb

  destroy: (cb)->
    console.log("destroy")
    
    app.services[@name].destroy {id:@id}, (err, data)=>
      if err
        @trigger("error", err)
        cb(err) if cb
        return
      @set(data)
      cb(null, data) if cb





