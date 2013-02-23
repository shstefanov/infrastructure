
module.exports = class Service

  dispatcher: _.extend({}, Backbone.Events)

  constructor: (name)->
    app.socket.emit(name, {action:"service_index"})
    app.socket.on name, (data)=>
      @dispatcher.trigger(data.action, data.body)
      if(data.reqId)
        @dispatcher.trigger(reqId, data)
        @dispatcher.off(reqId)
        return
      if(data.action == "service_index")
        data.body.forEach (method)=>
          @[method] = (data, meta, callback)=>
            dataAndMeta = (data, meta)=>
              app.socket.emit(name, {action:method, body:data, meta:meta})
            withCallback = (data, meta, callback)=>
              reqID = _.uniqueId(name+"_"+method)
              app.socket.emit(name, {action:method, body:data, meta:meta, reqId:reqId})
              @dispatcher.on reqId, (data)=>
                @dispatcher.off(reqId)
                callback(data.body)
            onlyCallback = (callback)=>
              @dispatcher.on(method, callback)
            
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




  
