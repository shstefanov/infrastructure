viewOptions = 
  app:@app
  router:@router
  req:req
  res:res
  next:next
module.exports = 

  initialize: (options)->
    {@app, @router, @req, @res, @next, @send} = options

  render: ->
    #Render method for server usage
    @template(@data)
