


bindToView = (req, res, next)->
  

bindToMethod = (req, res, next)->


module.exports = 

  initialize: (@app)->
    #TODO - initialize the layout
    #Binding the routes
    if !@views
      @initializeViews()
      for route, viewName of @routes
        if @views[viewName]
          @app[@method] route, (req,res,next)=>
            connection = 
              app:@app
              router:@router
              req:req
              res:res
              next:next
              send: (err, data)=> #Here comes the collections and models
                if err
                  res.end err.status || 500, err.body || err
                else
                  # TODO
                  # 1 RENDER the layout (with view's locals)
                  layout = @layout.template(data)
                  # 2 RENDER the view
                  # 3 REPLACE layout's appenTo node with view, wrapped with layout's appendTo tag
                  # 4 send the result
                  @res.end data.status || 200, data.body || data
            #Add pluginsMap point here
            view = new @views[viewName](connection)
        else
          throw new Error "Can't find view for route "+key+" in file "+@filepath
  
  initializeViews: ->
    for name, props of @views
      @views[name] = @app.View.extend(props)
    
