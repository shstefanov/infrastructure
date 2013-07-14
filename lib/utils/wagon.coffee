_ = require "underscore"

getType = (type)->
  return typeof type

# Wrtite here some other types (date, Buffer or something)
baseTypeInitValues = 
  object: {}
  string: ""
  number: 0

getInitValue = (type)->
  return baseTypeInitValues[type]

addReOption =(opt, options)->
  if !options
    return opt
  else
    if options.indexOf(opt) == -1
      return opt+options
    else
      return options

removeReOption =(opt, options)->
  if !options
    return ""
  else
    if options.indexOf(opt) == -1
      return options
    else
      return options.replace(opt, "")


where_find = (store, arg, ctx)->
  return _.find(store, arg, ctx) if typeof arg is "function"
  if typeof arg is "object"
    return _.where store, arg
  else #??????
    return _.find store, (el)->
      arg == el
    , ctx

underscore_array_methods = {
  passive:
  #passive
    "each": (store, cb)-> _.each(store, cb)
    
    #+ find with object
    "find" : (store, arg, ctx)-> #returns just one result
      return _.find(store, arg, ctx) if typeof arg is "function"
      if typeof arg is "object"
        return _.findWhere store, arg
      else #??????
        return _.find store, (el)->
          arg == el
        , ctx
    "where": (store, arg)-> #Like findAll
      return _.filter(store, arg) if typeof arg is "function"
      if typeof arg is "object"
        return _.where store, arg
      else 
        return _.filter store, (el)->
          return arg == el
        , ctx
    "findWhere" where_find
    "every" : (store, cb)->
      _.every store, cb
    "some" # just returns if any object passes the truth test
    "contains" #Try to write variant with object and properties
    "invoke" # just as forEach with some more extras like argument passing
    "pluck"
    "max"  #try to write variant for passing object with properties
    "min" #try to write variant for passing object with properties
    "countBy"
    "toArray" #Also for objects, atrings and etc
    "size": #Also for objects, atrings and etc
    "intersection"
    "difference"
    "zip"#-['moe','larry','curly'],[30,40,50],[true,false,false]-[["moe",30,true],["larry",40,false],["curly",50,false]]
    "object" #['moe', 'larry', 'curly'], [30, 40, 50]-{moe: 30, larry: 40, curly: 50}
              #[['moe', 30], ['larry', 40], ['curly', 50]]-{moe: 30, larry: 40, curly: 50}
    "indexOf"
    "lastIndexOf"
    "sortedIndex"

  active:

    #passive or active
    "groupBy" #try to write variant for passing object with properties
    "sortBy" #try to write variant for passing object with properties
    "map" #??? passive and active [alias - collect]
    "reduce"
    "reduceRight"
    "filter"
    "reject" #try with object for objects
    "without" #try to write variant for passing object and strings 
    "uniq" #try to write variant for passing object (for any of all properties equal)
    "shuffle"
]

class Wagon
  cargo = {}
  
  constructor:(options)->
    if options
      _.extend(@types, options.types) if options.types
      @cargo = options.cargo || {}
      @baseType = @custom[options.defaultType] || options.defaultType || []
      if options.worker
        @worker = options.worker
        @worker.init({wagon:@})
    else
      @baseType = []
     
      @cargo = {}

  addCargo: (cargo)->
    #kjsdkjldkjalskjd

  cache:{}

  getCache: (id, data)
    return this.cache[id]

  setCache: (id, data)
    this.cache[id] = data
    data

  types:
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
          afterAll: (pattern, val, re_options)-> 
            setter store.replace(new RegExp(pattern, addReOption("g", re_options)), pattern+val)
          before: (pattern, val, re_options)-> 
            setter store.replace(new RegExp(pattern, removeReOption("g", re_options)), val+pattern)
          beforeAll: (pattern, val, re_options)-> 
            setter store.replace(new RegExp(pattern, removeReOption("g", re_options)), val+pattern)
          replace: (pattern, val, re_options)->
            setter store.replace(new RegExp(pattern, removeReOption("g", re_options)), val)
          replaceAll: (pattern, val, re_options)->
            setter store.replace(new RegExp(pattern, removeReOption("g", re_options)), val)
        return res
      pull: (store, setter)->
        self = @
        res = 
          all: ()->
            result = store
            setter ""
          between: (v1, v2)->
            if !v1 || store.indexOf(v1) == -1
              return ""
            else
              i1 = store.indexOf(v1)
            if !v2 || store.indexOf(v1) == -1
              return ""
            else if 
            else
              i2 = store.indexOf(v2)

            if i1 > i2
              i1+=v1.length
            else if i1< i2
              i2+=v2.length
              
            res = store.substring(i1,i2)
            setter store.replace res, ""
            return res
          betweenWith: (v1, v2)->
            if !v1 || store.indexOf(v1) == -1
              return ""
            else
              i1 = store.indexOf(v1)
            if !v2 || store.indexOf(v1) == -1
              return ""
            else if 
            else
              i2 = store.indexOf(v2)

            if i1 > i2
              i2+=v2.length
            else if i1< i2
              i1+=v1.length
              
            res = store.substring(i1,i2)
            setter store.replace res, ""
            return res
        return res

    "number": 
      initValue: 0
      push: (store, setter, value)->
        setter store+value
        @
      pull: (store, setter, value)->
        setter store-value
        @

    "array": 
      initValue: []
      push: (store, setter)->
        self = @
        res =
          first: (data)=>
            setter data.concat store
            return self
          last: (data)=>
            setter store.concat data
            return self
          at: (num, data)=>
            rest = store.splice(num)
            setter store.concat(data.concat(rest))
            return self
        return res
   
    "object": 
      initValue: {}
      push: (store, setter, data)->
        setter _.extend data
      pull: (store, setter, data)->

    "OR": 
      initValue: false 
      sum: (v1,v2)->  v1 || v2
    "AND":
      initValue: false 
      sum: (v1,v2)->  v1 && v2
    "XOR":
      initValue: false 
      sum:  (v1,v2)->  !v1!=!v2

  pushToArray(name)
    cargo = @cargo
    

  #getInitValue returns init value for base types

  createType: (name, type)->
    

  push: (name, initial, parser)->
    if typeof name == "string" # It's a collection name
      if !@cargo[type] #Can't find it - initialize new type
        @createType type, initial, parser
        return @
      else
        @cargo[type]
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
        
      else if typeof cargo[type] == "object"
        result = cargo[type]
        delete cargo[type]
        return result
      else
        return 

module.exports = Wagon
