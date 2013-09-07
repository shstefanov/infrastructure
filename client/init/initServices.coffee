#Backbone = require "backbone"
class Service

  dispatcher: {}

  eventListener: _.extend({}, Backbone.Events)

  constructor: (@name, @_cb)->
    app.socket.emit("service", {service: @name, action:"service_index"})
    
  handle: (data)->
    @eventListener.trigger(data.action, data.body)
    if(data.reqId && @dispatcher[data.reqId])
      @dispatcher[data.reqId](null, data.body) if data.meta is "success"
      @dispatcher[data.reqId](data.body) if data.meta is "error"
      delete @dispatcher[data.reqId]
      return

    if(data.action == "service_index")
      
      @_counter = data.body.length
      data.body.forEach (method)=>

        @[method] = (data, meta, callback)=>

          dataAndMeta = (data, meta)=>
            app.socket.emit("service", {service:@name, action:method, body:data, meta:meta})

          withCallback = (data, meta, cb)=>
            reqId = _.uniqueId(@name+"_"+method)
            app.socket.emit("service", {service:@name,action:method, body:data, meta:meta, reqId:reqId})
            @dispatcher[reqId] = cb

          onlyCallback = (callback)=>
            @eventListener.on(method, callback)
          
          if(typeof callback == "function")
            withCallback(data, meta, callback)
            return
          if(typeof meta == "function")
            withCallback(data, undefined, meta)
            return
          if(typeof data == "function")
            onlyCallback(data)
            return
          dataAndMeta(data, meta)
      
        
        @_counter--;
        if(@_counter == 0)
          @_cb()
          delete @_cb
          delete @_counter



module.exports = (serviceNames, callback)->
  counter = serviceNames.length
  callback() if counter == 0
  for name in serviceNames
    app.services[name] = new Service name, ->
      counter--
      if(counter == 0)
        callback()

  app.socket.on "service", (data)->
    app.services[data.service].handle(data)
