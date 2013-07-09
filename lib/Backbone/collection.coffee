_ = require "underscore"
collection = require "../../client/init/collection.coffee"

extension = 
  
  initialize: (options)->
    console.log "intializing collection"

module.exports = _.extend collection, extension