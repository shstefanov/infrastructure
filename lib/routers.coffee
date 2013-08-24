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

  defineRouter = (router)->

    buildRouter = (router, router_root_uri)->
      # Find routers's routes
      if router.routes
        for route, v of router.routes
          #view = new View v, 
          route.split(",").forEach (ro)->
            console.log router_root_uri+ro.replace(/\s/g, "")
            #console.log((router_root_uri+ro).yellow)
            #routesMap[router_root_uri+ro] = view
            #buildRouter view.router, (router_root_uri+ro) if view.router
    buildRouter router, router.root || "/"



    
  routersPath = fs.readdirSync(config.routers)
  for routerPath in routersPath
    path = path.normalize "#{config.routers}/#{routerPath}" 
    if fs.statSync(path).isDirectory() and fs.existsSync "#{path}/index.js" or fs.existsSync "#{path}/index.coffee" 
      if fs.existsSync "#{path}/index.js" or fs.existsSync "#{path}/index.coffee" 
        defineRouter require path
    else
      defineRouter require path
  

