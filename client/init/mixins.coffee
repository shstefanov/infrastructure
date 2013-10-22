
module.exports = 
  mapObject: _.compose _.object, (obj, itr)-> 
    return _.map obj, (el, idx)-> 
      parsed = null
      itr el, idx, (v, k)-> 
        parsed = [k||idx, v]
      return parsed
