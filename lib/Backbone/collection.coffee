_ = require "underscore"
collection = require "../../client/base/collection.coffee"

extension = 
  
  initialize: (options)->
    console.log "intializing collection"

module.exports = _.extend collection, extension