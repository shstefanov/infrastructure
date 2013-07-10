path = require "path"
fs = require "fs"

class Router
  #Object properties = @root, @routes, @views, @method, @layout, @filepath, @filename, @name
  #Environment properties  = @app

  #Initialize the layout
  initLayout: ->
    class Layout extends @app.View 
    for key, val of @layout
      Layout::[key] = val
    Layout::app = @app
    @Layout = Layout

    #Outer layout - make assets function for top-level layouts only
    if @root == "" && typeof @app.pluginsMap.assetRenderers == "object"
      @Layout::assets = ->
        result = ""
        for assetName in Object.keys(@app.pluginsMap.assetRenderers)
          template = @app.pluginsMap.assetRenderers[assetName]
          if Array.isArray(@[assetName])
            locals = {}
            locals[assetName] = @[assetName]
            result+=template(locals)+"\n\n"

        return result
    


  init: (router)->
    
    if typeof @routes != "object" || Object.keys(@routes).length==0
      throw new Error('Router '+@root+' don\'t have any routes')
    
    if typeof @views != "object" || Object.keys(@views).length==0
      throw new Error('Router '+@root+' don\'t have any views')
      

  initTopLevel: (router)->
    filepath = path.normalize(@app.config.routers+"/"+router._filename)
    name = router._filename.split(".").shift()
    filename = name+".js"
    stat = fs.statSync filepath
    if stat.isDirectory()
      if fs.existsSync(filepath+"/index.js")
        filepath+="/index.js"
      else if fs.existsSync(filepath+"/index.coffee")
        filepath+="/index.coffee"
      else 
        throw new Error("Can't find bundle path: "+filepath)
    
    _app = @app
    #Fetching assets from nested views to top-level layout
    mergeAssets = (arr)->
      result = {}
      for assets of arr
        for name of Object.keys(_app.pluginsMap.assetRenderers)
          if !assets[name]
            continue
          else
          result[name] = [] if !result[name]
          result[name].push(thing) for thing in assets[name]
      return result
    
    returnAssets = ->
      result = {}
      #First - get my assets
      my = {}
      for assetName in Object.keys(_app.pluginsMap.assetRenderers)
        if @[assetName]
          my[assetName] = @[assetName]
      #Then get assets from childs
      child_assets = []
      if @router && @router.views
        for viewName in Object.keys(@router.views)
          view = @router.views[viewName]
          child_assets.push returnAssets.call(view)
        #Add my asset to child's assets
        child_assets.push my
        return mergeAssets child_assets
      else
        return my

    my_assets = returnAssets(@layout)
    childsAssets = []
    for viewName in Object.keys(@views)
      view = @views[viewName]
      childsAssets.push(returnAssets.call(view))
    childsAssets.push my_assets

    all_assets = mergeAssets(childsAssets)
    for viewName in Object.keys(all_assets)
      @layout[viewName] = all_assets[viewName]
    console.log "All top level assets", all_assets

    mountPoint = "/routers/"+filename
    @app.pluginsMap.bundle.push
      name: name
      load:true
      mountPoint: mountPoint
      entryPoint: filepath
      cache:@app.config.bundlesSettings.cache
      watch:@app.config.bundlesSettings.watch
    if !@javascripts
      @javascripts = []
    @javascripts.unshift(mountPoint)


  initializeRouters: (view, routeName)->
    if view.router
      router = view.router
      router.roots = @roots.push routeName
      console.log router
      router.method = @method
      router.layout = view
      new @app.Router(router, @app)

  constructor: (options, @app)->
    {@roots, @routes, @views, @method, @layout, @filepath, @filename, @name } = options
    #console.log "initializing route", @routes
   
    @root = @root || ""
    @roots = options.roots || []
    #It's top-level router
    if @roots.length == 0
      @initTopLevel(options) 

    @init(options)
    @initLayout()
    #Binding the routes
    if @views
      for route, viewName of @routes
        targetView = @views[viewName]
        if targetView
          @initializeRouters(targetView, route)
          @initializeViews(targetView, viewName)
          console.log "setup route", @root+route
          @app[@method] @roots.join("")+route, (req,res,next)=>
            #TODO = find top-lewel router and run it with [roots] queue
            #Initialize and render only needed views!!!
            #Create router.fallow({path:declared route, request:requested route})
            layout = new @Layout(@app)
            #Add pluginsMap for connection here
            connection = 
              params:req.params
              next:next
              addAssets: (assets)=>
                for key in Object.keys(assets)
                  asset = assets[key]
            
            view = new targetView(connection)
            layout.append view
            layout.get (err)=>
              if err
                throw err
                res.send(500, err)
              else
                layout.render (error, html)=>
                  if error
                    res.send 500, error
                  else
                    res.send 200, html
        else
          throw new Error "Can't find view '"+viewName+"' for route '"+route+"' in file "+@filepath
  
  initializeViews: (view, name)->
    class ExtendedView extends @app.View
    for key, val of view
      ExtendedView::[key] = val
    @views[name] = ExtendedView
    
module.exports = Router
