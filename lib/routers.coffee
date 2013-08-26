fs = require "fs"
path = require "path"

View = require "./Backbone/view.coffee"
Router = require "./Backbone/router.coffee"


#Allowed http request methods
methods = 
  get:    "get"
  post:   "post"
  put:    "put"
  del:    "del"
  GET:    "get"
  POST:   "post"
  PUT:    "put"
  DEL:    "del"


routesMap = {}

module.exports = (app, config, coreLibs)->
  
  return if !fs.existsSync config.routers

  defineApp = (MainLayout)->  #expecting view as layout

    active_routes = {}
    layout = new View MainLayout
    
    layout.javascripts = coreLibs.slice().concat(config.defaultJavascripts || []).concat(layout.javascripts || [])
    layout.styles = (config.defaultStyles || []).concat(layout.styles || [])

    buildRouter = (router, parent_uri)->
      router.root = path.normalize(parent_uri+"/"+(router.root || "") )
      for route, view of router.routes
        view_uri = path.normalize(router.root+"/"+route)
        active_routes[view_uri] = buildView(view, view_uri)

    buildView = (view, uri)->
      # Collecting assets
      layout.javascripts = layout.javascripts.concat(view.javascripts) if view.javascripts
      layout.styles = layout.styles.concat(view.styles) if view.styles
      
      # Build the router
      buildRouter view.router, uri if view.router
      return new View(view)


    buildRouter layout.router, layout.router.root || "/" if layout.router

    # TODO - create bundle for this apptree layout and add it to javascripts
    
  routersPath = fs.readdirSync(config.routers)
  for routerPath in routersPath
    module_path = path.normalize "#{config.routers}/#{routerPath}" 
    if fs.statSync(module_path).isDirectory()
      defineApp require module_path if fs.existsSync module_path+"/index.js"
      defineApp require module_path if fs.existsSync module_path+"/index.coffee"
    else
      ext = module_path.split(".").pop()
      defineApp require module_path if /(\.js|\.coffee)$/.test module_path
  

