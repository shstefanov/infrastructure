
class Wagon
  store = {}
  constructor:(@cargo, @path)->

  methods:
    first: (data)->
    last: (data)->

  push: (type)->
    wagon = @
    if typeof type == "string"
      @store[type] = [] if !@store[type]
      return
        first: (data)->
          data = [data] if !Array.isArray(data)
          wagon.store[type] = data.concat wagon.store[type]
        last: (data)->
          data = [data] if !Array.isArray(data)
          wagon.store[type] = wagon.store[type].concat data
        at: (num, data)->
          rest = @store.splice(num)
          data = [data] if !Array.isArray(data)
          store[type].concat(data.concat(rest))

  push: (type)->
    wagon = @
    if typeof type == "string"
      @store[type] = [] if !@store[type]
      return
        first: (data)->
          data = [data] if !Array.isArray(data)
          wagon.store[type] = data.concat wagon.store[type]
        last: (data)->
          data = [data] if !Array.isArray(data)
          wagon.store[type] = wagon.store[type].concat data
        at: (num, data)->
          rest = @store.splice(num)
          data = [data] if !Array.isArray(data)
          store[type].concat(data.concat(rest))

module.exports = Wagon
