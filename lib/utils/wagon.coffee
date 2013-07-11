_ = require "underscore"

class Wagon
  store = {}
  constructor:(@cargo)->

  methods:
    first: (data)->
    last: (data)->

  push: (type, initial)->
    store = @store
    if typeof type == "string"
      @store[type] = (initial || []) if !@store[type]
      return
        first: (data)=>
          data = [data] if !Array.isArray(data)
          store[type] = data.concat wagon.store[type]
          return @
        last: (data)=>
          data = [data] if !Array.isArray(data)
          store[type] = store[type].concat data
          return @
        at: (num, data)=>
          rest = @store.splice(num)
          data = [data] if !Array.isArray(data)
          store[type].concat(data.concat(rest))
          return @
    else if typeof type == "object"
      for key, val of type
        if Array.isArray(val) && Array.isArray(store[key])
          store[key].push(v) for v in val
        else if typeof val == "string" && store[key] == "string"
          store[key]+=val
        else if typeof store[key] == "object" && typeof val == "object"
          _.extend(store[key], val)
        else
          store[key].push(val)
        return @

  pull: (type)->
    store = @store
    if typeof type == "string"
      if typeof Array.isArray(store[type])
        return
          first: (num)->
            return store[type].splice(0, num);
          last: (data)->
            return store[type].splice(-num);
          at: (num, len)->
            return store[type].splice(num, len);
          all: ->
            result = store[type]
            delete store[type]
          where: (comparator)->
            #If comparator is function, run all members and return these with positive result
            if typeof comparator == "function"
              if Array.isArray(store[type])
                results = []
                idx = 0
                for member of store[type]
                  results.push(store[type].splice(idx, ++idx)) if comparator(member)
                return results
              if typeof store[type] == "object"
                results = {}
                for key, value of store[type]
                  if comparator(value)
                    results[key] = value
                    delete store[type][key]
                return results

            if typeof comparator == "object"


            # If resoutce is array - check for value and return it
            else if Array.isArray(store[type])
              #If comparator is value, 


      else if typeof store[type] == "object"
        result = store[type]
        delete store[type]
        return result
      else
        return 


    else if

module.exports = Wagon
