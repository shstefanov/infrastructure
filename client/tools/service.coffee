
module.exports = class Service

  dispatcher: {}
  eventListener: _.extend({}, Backbone.Events)

  constructor: (@name)->
    app.socket.emit(@name, {action:"service_index"})
    app.socket.on @name, (data)=>

      @eventListener.trigger(data.action, data.body)
      if(data.reqId && @dispatcher[data.reqId])
        @dispatcher[data.reqId](null, data.body) if data.meta is "success"
        @dispatcher[data.reqId](data.body) if data.meta is "error"
        delete @dispatcher[data.reqId]
        return

      if(data.action == "service_index")
        data.body.forEach (method)=>

          @[method] = (data, meta, callback)=>
            console.log("sending something")
            console.log(@name, method, data, meta, callback)

            dataAndMeta = (data, meta)=>
              console.log("here - 11111111")
              app.socket.emit(@name, {action:method, body:data, meta:meta})

            withCallback = (data, meta, callback)=>
              console.log("here - 222222222222")
              reqId = _.uniqueId(@name+"_"+method)
              app.socket.emit(@name, {action:method, body:data, meta:meta, reqId:reqId})
              @dispatcher[reqId] = callback

            onlyCallback = (callback)=>
              console.log("here - 333333333333333")
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
