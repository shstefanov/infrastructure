
module.exports = 
  initialize: (options)->
    @options = new Backbone.Model({skip:0,limit:20})

  fetch: (pattern, options)->
    ptr = pattern || {}
    app.services[@__name].find ptr, @options.attributes, (err, res)=>
      if err
        @trigger "error", err
        return
      @reset(res)
    @
    
