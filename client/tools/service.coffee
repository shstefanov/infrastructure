
module.exports = class Service

  dispatcher: {}
  eventListener: _.extend({}, Backbone.Events)

  constructor: (@name, cb)->

    app.socket.emit(@name, {action:"service_index"})
    app.socket.on @name, (data)=>

      @eventListener.trigger(data.action, data.body)
      if(data.reqId && @dispatcher[data.reqId])
        @dispatcher[data.reqId](null, data.body) if data.meta is "success"
        @dispatcher[data.reqId](data.body) if data.meta is "error"
        delete @dispatcher[data.reqId]
        return

      if(data.action == "service_index")
        
        methodsCounter = data.body.length
        data.body.forEach (method)=>
          
          @[method] = (data, meta, callback)=>

            dataAndMeta = (data, meta)=>
              app.socket.emit(@name, {action:method, body:data, meta:meta})

            withCallback = (data, meta, callback)=>
              reqId = _.uniqueId(@name+"_"+method)
              app.socket.emit(@name, {action:method, body:data, meta:meta, reqId:reqId})
              @dispatcher[reqId] = callback

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
        
          
          methodsCounter--;
          if(methodsCounter == 0)
            cb(@name)
