
module.exports = class Service

  dispatcher: _.extend({}, Backbone.Events)
  eventListener: _.extend({}, Backbone.Events)

  constructor: (@name)->
    app.socket.emit(@name, {action:"service_index"})
    app.socket.on @name, (data)=>
      @eventListener.trigger(data.action, data.body)
      if(data.reqId)
        @dispatcher.trigger(data.reqId, data)
        @dispatcher.off(data.reqId)
        return
      if(data.action == "service_index")
        data.body.forEach (method)=>
          console.log("set method", @name, method)
          @[method] = (data, meta, callback)=>
            dataAndMeta = (data, meta)=>
              app.socket.emit(@name, {action:method, body:data, meta:meta})
            withCallback = (data, meta, callback)=>
              reqId = _.uniqueId(@name+"_"+method)
              console.log("with callback:", reqId)
              app.socket.emit(@name, {action:method, body:data, meta:meta, reqId:reqId})
              @dispatcher.on reqId, (data)=>
                @dispatcher.off(data.reqId)
                if(data.meta == "success")
                  callback(null, data.body)
                  return
                if(data.meta == "error")
                  callback(data.body)
                  return
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




  
