_ = require "underscore"

# to escape - . \ + * ? [ ^ ] $ ( ) { } = ! < > | : - ' "

checkOne = (data, pattern)->
  pass = true
  for k, v of pattern
    if !_.isEqual(data[k],v)
      pass = false
      break
   return _.clone(data) if pass

removeReOption = (option, options)->
  opts = options || ""
  if opts.indexOf(option) > -1
    return opts.replace(option, "")
  else
    return opts

addReOption = (option, options)->
  opts = options || ""
  if opts.indexOf(option) == -1
    option+opts
  else
    return opts


defaultTypes = 
  
  "string":
    initValue: ""
    push: (store, setter)->
      self = @
      res = 
        first: (val)-> 
          setter val+store
          self
        last: (val)-> 
          setter store+val
          self
        after: (pattern, val, re_opt)->
          setter store.replace(new RegExp(pattern, removeReOption("g", re_opt)), pattern+val)
          return self
        afterAll: (pattern, val, re_options)-> 
          setter store.replace(new RegExp(pattern, addReOption("g", re_options)), pattern+val)
          return self
        before: (pattern, val, re_options)-> 
          setter store.replace(new RegExp(pattern, removeReOption("g", re_options)), val+pattern)
          return self
        beforeAll: (pattern, val, re_options)-> 
          setter store.replace(new RegExp(pattern, addReOption("g", re_options)), val+pattern)
          return self
        replace: (pattern, val, re_options)->
          setter store.replace(new RegExp(pattern, removeReOption("g", re_options)), val)
          return self
        replaceAll: (pattern, val, re_options)->
          setter store.replace(new RegExp(pattern, addReOption("g", re_options)), val)
          return self
      return res
    pull: (store, setter)->
      self = @
      res = 
        all: ->
          result = store
          setter ""
          result
        before: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          result = store.substring(0,idx)
          setter store.replace(result, "")
          return result
        beforeWith: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          result = store.substring(0,idx+pattern.length)
          setter store.replace(result, "")
          return result
        after: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          result = store.substring(idx+pattern.length)
          setter store.replace(result, "")
          return result
        afterWith: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          result = store.substring(idx)
          setter store.replace(result, "")
          return result
        between: (v1, v2)->
          if !v1 || store.indexOf(v1) == -1
            return ""
          if !v2 || store.indexOf(v1) == -1
            return ""
          
          i1 = store.indexOf(v1)
          i2 = store.indexOf(v2)

          if i1 > i2
            i2+=v1.length
          else if i1< i2
            i1+=v2.length
          else
            return ""
          res = store.substring(i1,i2)
          setter store.replace res, ""
          res
        betweenWith: (v1, v2)->
          if !v1 || store.indexOf(v1) == -1
            return ""
          if !v2 || store.indexOf(v1) == -1
            return ""
          i1 = store.indexOf(v1)
          i2 = store.indexOf(v2)

          if i1 > i2
            i1+=v2.length
          else if i1< i2
            i2+=v1.length
          else
            return ""
            
          res = store.substring(i1,i2)
          setter store.replace res, ""
          return res
      return res
    get: (store)->
      self = @
      res = 
        all: ->
          store
        before: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          store.substring(0,idx)
        beforeWith: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          return store.substring(0,idx+pattern.length)
        after: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          return store.substring(idx+pattern.length)
        afterWith: (pattern)->
          idx = store.indexOf(pattern)
          return "" if idx < 1
          return store.substring(idx)
        between: (v1, v2)->
          if !v1 || store.indexOf(v1) == -1
            return ""
          if !v2 || store.indexOf(v1) == -1
            return ""
          
          i1 = store.indexOf(v1)
          i2 = store.indexOf(v2)

          if i1 > i2
            i2+=v2.length
          else if i1< i2
            i1+=v1.length
          else
            return ""
          return store.substring(i1,i2)
        betweenWith: (v1, v2)->
          if !v1 || store.indexOf(v1) == -1
            return ""
          if !v2 || store.indexOf(v1) == -1
            return ""
          i1 = store.indexOf(v1)
          i2 = store.indexOf(v2)

          if i1 > i2
            i1+=v1.length
          else if i1< i2
            i2+=v2.length
          else
            return ""
            
          return store.substring(i1,i2)
      return res

  "array": 
    initValue: []
    push: (store, setter)->
      self = @
      res =
        first: (data)=>
          data = [data] if !Array.isArray(data)
          setter data.concat store
          return self
        last: (data)=>
          data = [data] if !Array.isArray(data)
          setter store.concat data
          return self
        at: (num, data)=>
          data = [data] if !Array.isArray(data)
          rest = store.splice(num)
          setter store.concat(data.concat(rest))
          return self
      return res
    pull: (store, setter)->
      res = 
        at: (n1, n2)->
          result = store.splice(n1,n2)
          setter store
          result
        where: (obj)->
          result = []
          rest = []
          
          for index, val of store
            if Array.isArray(obj)
              oneofthem = false
              for i, p of obj
                res = checkOne val, p
                if typeof res != "undefined"
                  result.push res
                  oneofthem = true
                  break
              rest.push val if !oneofthem
            else
              res = checkOne val, obj
              if typeof res != "undefined"
                result.push res
              else
                rest.push val
          setter rest
          result
    get: (store)->
      res = 
        all: ->
          store.slice(0)
        at: (n1, n2)->
          if typeof n2 == "undefined"
            return _.clone(store[n1])
          else
            result = []
            for i, v of store.slice(n1,n2)
              result.push _.clone(v)
            result
        where: (obj)->
          result = []
          
          for index, val of store
            if Array.isArray(obj)
              for i, p of obj
                res = checkOne val, p
                if typeof res != "undefined"
                  result.push res
                  break
            else
              res = checkOne val, obj
              if typeof res != "undefined"
                result.push res
          result

  "object": 
    initValue: {}
    push: (store, setter)->
      self = @
      res = 
        soft: (obj)=>
          for key, val of obj
            store[key] = val if !Object.prototype.hasOwnProperty.call store, key
          setter store
          return @
        hard: (obj)=>
          for key, val of obj
            store[key] = val
          setter store
          return @

      setter _.extend data
    pull: (store, setter, data)->
      fields = []
      if Array.isArray(data)
        fields = data
      else if typeof data == "object"
        for k,v of data
          fields.push k if v
      else
        return {}
      result = {}
      for field of fields
        result[field] = store[field]
        delete store[field]
      setter store
      result
    get:  (store)->
      fields = []
      if Array.isArray(data)
        fields = data
      else if typeof data == "object"
        for k,v of data
          fields.push k if v
      else
        return {}
      result = {}
      for field of fields
        result[field] = store[field]
      result

  "OR": 
    initValue: false
    push: (store, setter)->
      setter v1 || v2
    pull: (store, setter)->
      setter false
      store
    get: (store)->
      store
  
  "AND":
    initValue: false 
    push: (store, setter)->
      setter v1 && v2
    pull: (store, setter)->
      setter false
      store
    get: (store)->
      store
  
  "XOR":
    initValue: false 
    push: (store, setter)->
      setter !v1!=!v2
    pull: (store, setter)->
      setter false
      store
    get: (store)->
      store


globalCache = {}

class Wagon
  localTypes: {}
  cargoIndex:{}

  getTypeDefinition: (name, handlerType)->
    if @cargoIndex[name] && @cargoIndex[name].type
      type = @cargoIndex[name].type
      if @localTypes[type]
        return @localTypes[type][handlerType]
      else if defaultTypes[type]
        return defaultTypes[type][handlerType]
      else
        return undefined
  
  constructor:(options)->
    if options
      _.extend(@types, options.types) if options.types
      @cargo = options.cargo || {}
      @baseType = @custom[options.defaultType] || options.defaultType || []
      if options.worker
        @worker = options.worker
        @worker.init(@)
    else
      @baseType = []
      @cargo = {}

  addCargo: (cargo)->
    _.extend(@cargo, cargo)

  cache:{}


  getCache: (id, data)->
    return this.cache[id]

  setCache: (id, data)->
    this.cache[id] = data
    data

  create: (name, type)->
    if !@cargoIndex[name]
      #Check if type is default type
      if defaultTypes[type]
        @cargoIndex[name] = {type:type, initValue:defaultTypes[type].initValue}
        @cargo[name] = defaultTypes[type].initValue
      else if @localTypes[type]
        @cargoIndex[name] = {type:type, initValue:@localTypes[type].initValue}
        @cargo[name] = @localTypes[type].initValue
      else
        throw new Error("Can't create non existing type")
    else
      throw new Error("Can't override existing type")
  
  push: (name)->
    if Object.prototype.hasOwnProperty.call @cargo, name
      handler = @getTypeDefinition.call @, name, "push"
      return handler.call @, @cargo[name], (store_data)=>
        @cargo[name] = store_data
      
  pull: (name)->
    if Object.prototype.hasOwnProperty.call @cargo, name
      handler = @getTypeDefinition.call @, name, "pull"
      return handler.call @, @cargo[name], (store_data)=>
        @cargo[name] = store_data
  
  get: (name)->
    if Object.prototype.hasOwnProperty.call @cargo, name
      handler = @getTypeDefinition.call @, name, "get"
      return handler.call @, @cargo[name]
  

module.exports = Wagon