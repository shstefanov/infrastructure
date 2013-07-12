_ = require "underscore"

class Wagon
  cargo = {}
  
  constructor:(options)->
    if options
      @defaultType = options.defaultType || []
      @cargo = options.cargo || {}
    else
      @defaultType = []
      @cargo = {} 

  push: (type, initial)->
    cargo = @cargo
    if typeof type == "string"
      @cargo[type] = (initial || @defaultType || []) if !@cargo[type]
      res =
        first: (data)=>
          data = [data] if !Array.isArray(data)
          cargo[type] = data.concat wagon.cargo[type]
          return @
        last: (data)=>
          data = [data] if !Array.isArray(data)
          cargo[type] = cargo[type].concat data
          return @
        at: (num, data)=>
          rest = @cargo.splice(num)
          data = [data] if !Array.isArray(data)
          cargo[type].concat(data.concat(rest))
          return @
      return res
    else if typeof type == "object"
      Object.keys(type).forEach (key)=>
        val = type[key]
        if(!cargo[key])
          cargo[key] = [val]
          return
        if Array.isArray(val) && Array.isArray(cargo[key])
          cargo[key].push(v) for v in val
        else if typeof val == "string" && cargo[key] == "string"
          cargo[key]+=val
        else if typeof cargo[key] == "object" && typeof val == "object"
          _.extend(cargo[key], val)
        else
          cargo[key].push(val)
      return @

  pull: (type)->
    cargo = @cargo
    wagon = @
    if typeof type == "string"
      if typeof Array.isArray(cargo[type])
        res = 
          first: (num)->
            return cargo[type].splice(0, num);
          last: (data)->
            return cargo[type].splice(-num);
          at: (num, len)->
            if typeof len == "undefined"
              return cargo[type].splice(num, 1)[0];
            else
              return cargo[type].splice(num, len);
          all: ->
            result = cargo[type]
            delete cargo[type]
          where: (comparator)->
            #If comparator is function, run all members and return these with positive result
            if typeof comparator == "function"
              if Array.isArray(cargo[type])
                results = []
                idx = 0
                for member of cargo[type]
                  results.push(cargo[type].splice(idx, ++idx)) if comparator(member)
                return results
              if typeof cargo[type] == "object"
                results = {}
                for key, value of cargo[type]
                  if comparator(value, key)
                    results[key] = value
                    delete cargo[type][key]
                return results
            else if typeof comparator == "object" && Array.isArray(cargo[type])
              results = []
              idx=0
              #May crash due to array change while doing loop !!!
              for member of cargo[type]
                results.push(wagon.pull(type).at(idx))
              return results
            else
              throw new Error("Wagon pull->where unsupported case")
        return res
      else if typeof cargo[type] == "object"
        result = cargo[type]
        delete cargo[type]
        return result
      else
        return 

module.exports = Wagon
