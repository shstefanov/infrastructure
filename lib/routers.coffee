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
  
  return if !fs.existsSync config.routers

  defineApp = (MainLayout)->  #expecting view as layout

    routes_collection = []
      

    # The main app tree
    routes_tree_root = {}
    
    
    buildRoute = (view, fragment, mount_to, all_previeous)->
      
      #The node
      full_path = path.normalize "/#{all_previeous}/#{fragment}"
      mount_to[fragment] = 
        __instance__   : buildView(view)
        __prototype__  : view
      
      #It's child view
      if all_previeous != ""
        mount_to[fragment].__parentNode__ = mount_to

      mount_to[fragment].__info__ =
        path: full_path
        fragment: fragment.replace /\//g, ""
      
      
      routes_collection.push mount_to[fragment]
      
      if view.router && view.router.routes
        for route, _view of view.router.routes
          buildRoute _view, route, mount_to[fragment], full_path
      
    
    buildView = (view)->
      
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


    routes_tree_root.__instance__             = new View(MainLayout)
    routes_tree_root.__instance__.javascripts = coreLibs.slice().concat(config.defaultJavascripts || []).concat(MainLayout.javascripts || [])
    routes_tree_root.__instance__.styles      = (config.defaultStyles || []).concat(MainLayout.styles || [])

    # nowrap for outer layouts
    MainLayout.nowrap = true
    buildRoute MainLayout, (MainLayout.router.root || "/" ), routes_tree_root, "" if MainLayout.router

    
    # TODO - create bundle for this apptree layout and add it to javascripts









    routes_collection.forEach (route)->
     
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
          view.__instance__.render
            params:req.params
            body:req.body
            query:req.query
          , (err, html)->
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
      defineApp require module_path if fs.existsSync module_path+"/index.js"
      defineApp require module_path if fs.existsSync module_path+"/index.coffee"
    else
      ext = module_path.split(".").pop()
      defineApp require module_path if /(\.js$|\.coffee)$/.test module_path
  

