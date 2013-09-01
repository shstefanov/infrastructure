fs = require "fs"
path = require "path"
_ = require "underscore"
async = require "async"

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

  system_javascripts = coreLibs.slice().concat(config.defaultJavascripts || [])
  system_styles      = config.defaultStyles || []
  
  return if !fs.existsSync config.routers

  defineApp = (MainLayout, filepath)->  #expecting view as layout

    routes_collection = []
      

    # The main app tree
    routes_tree_root = {}
    
    
    buildRoute = (view, fragment, mount_to, all_previeous)->
      
      if all_previeous == ""
        node = mount_to
      else
        node = mount_to[fragment] = {}
        node.__parentNode__ = mount_to


      #The node
      full_path = path.normalize "/#{all_previeous}/#{fragment}"
      
      node.__instance__   = buildView(view)
      node.__prototype__  = view
      
      node.__info__ =
        path: full_path
        fragment: fragment.replace /\//g, ""
      
      routes_collection.push node
      
      if view.router && view.router.routes
        for route, _view of view.router.routes
          buildRoute _view, route, node, full_path
      
    
    buildView = (view)->
      return new View view if !routes_tree_root.__instance__
        
      layout = routes_tree_root.__instance__
      
      # Collecting assets
      if view.javascripts
        `layout.javascripts.concat(Array.isArray(view.javascripts)? layout.javascripts.concat(view.javascripts):layout.javascripts.concat([view.javascripts]))`
      if view.styles
        `layout.styles.concat(Array.isArray(view.styles)? layout.styles.concat(view.styles):layout.javascripts.concat([view.styles]))`
      delete view.javascripts
      delete view.styles
      
      #Return view instance
      return new View(view)

    # nowrap for outer layouts
    MainLayout.nowrap = true

    MainLayout.javascripts  = [MainLayout.javascripts] if typeof MainLayout.javascripts == "string"
    MainLayout.styles       = [MainLayout.styles]      if typeof MainLayout.styles      == "string"
    MainLayout.javascripts  = system_javascripts       if typeof MainLayout.javascripts == "undefined"
    MainLayout.styles       = system_styles            if typeof MainLayout.styles      == "undefined"
    MainLayout.javascripts  = system_javascripts.slice().concat(MainLayout.javascripts) if Array.isArray MainLayout.javascripts
    MainLayout.styles       = system_styles.slice()     .concat(MainLayout.styles)      if Array.isArray MainLayout.styles

    # Start racursive view tree building
    buildRoute MainLayout, (MainLayout.router.root || "/" ), routes_tree_root, "" if MainLayout.router
    
    # App bundles will be mounted ubder "/complex" path and will looks like "/complex/root_path.js"
    `var mountpoint = (MainLayout.router.root || "/")=="/"? "/index.js": MainLayout.router.root+".js"`
    console.log filepath
    module_bundle =
      name:         MainLayout.router.root || "/"
      load:         true
      entryPoint:   filepath
      mountPoint:   "/complex/#{mountpoint}"
      cache:        config.bundlesOptions.cache || true,
      watch:        config.bundlesOptions.watch || false

    # Adding it to app bundles to initialized
    app.pluginsMap.bundles.push module_bundle

    # And adding it to module javascript to be loaded on request
    routes_tree_root.__instance__.javascripts.push path.normalize((config.bundlesOptions.prefix || "/bundles/")+module_bundle.mountPoint)




    routes_collection.forEach (route)->
      # console.log route
      # return
     
      # node structure: 

      #?__parentNode__
      # __instance__   : buildView(view)
      # __prototype__  : [Object object]
      # __info__.path: full_path
      # __info__.fragments: full_path.replace(/(^\/|\/$)/g, "").split("/")
      # __info__.fragment: fragment

      # First create array with parent nodes up to root
      map = []
      
      addParentNode = (node)->
        map.unshift node
        addParentNode node.__parentNode__ if node.__parentNode__
      addParentNode route

      if route.__prototype__.router && route.__prototype__.router.routes["/"]
        return

      ################## RENDER #####################
      app.get route.__info__.path, (req, res, next)->

        # !Asynchronous! #
        async.map map, (view, cb)->
          vars = 
            params:req.params
            #body:req.body
            query:req.query
          
          view.__instance__.render vars, (err, html)->
            if err
              cb err
            else
              cb null, {html:html, view:view.__instance__}
            
          # node structure: 

          #?__parentNode__
          # __instance__   : buildView(view)
          # __prototype__  : [Object object]
          # __info__.path: full_path
          # __info__.fragments: full_path.replace(/(^\/|\/$)/g, "").split("/")
          # __info__.fragment: fragment

        , (err, results)->
          if err
            res.send 500, err
          else
            assembler = _.map results, (node)->
              return (child_html, cb)->
                if typeof child_html == "function"
                  child_html null, node.html
                else
                  cb null, node.view.append(node.html, child_html)
            
            assembler = assembler.reverse()
            async.waterfall assembler, (err, html)->
              if err
                res.end 500, err
              else
                res.end html

            #res.send "results are {html:html, view:view}"

      ###################### /RENDER ################
    
  routersPath = fs.readdirSync(config.routers)
  for routerPath in routersPath
    module_path = path.normalize "#{config.routers}/#{routerPath}" 
    if fs.statSync(module_path).isDirectory()
      defineApp require(module_path), module_path  if fs.existsSync module_path+"/index.js"
      defineApp require(module_path), module_path  if fs.existsSync module_path+"/index.coffee"
    else
      ext = module_path.split(".").pop()
      defineApp require(module_path), module_path  if /(\.js$|\.coffee)$/.test module_path
  

