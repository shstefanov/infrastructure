path = require "path"

module.exports = (layout, cb)->

  $(document).ready =>

    routes_tree_root = {}
    routes_collection = []

    buildRoute = (view, fragment, mount_to, all_previeous)->
      
      if all_previeous == ""
        node = mount_to
      else
        node = mount_to[fragment] = {}
        node.__parentNode__ = mount_to


      #The node
      full_path = path.normalize "/#{all_previeous}/#{fragment}"
      
      node.__instance__   = new App.View view
      node.__prototype__  = view
      
      node.__info__ =
        path: full_path
        fragment: fragment.replace /\//g, ""
      
      routes_collection.push node
      
      if view.router && view.router.routes
        for route, _view of view.router.routes
          buildRoute _view, route, node, full_path

    buildRoute layout, (layout.router.root || "/" ), routes_tree_root, "" if layout.router

    console.log routes_collection
    # routes_collection.forEach (route)->

    #   map = []

    #   addParentNode = (node)->
    #     map.unshift node
    #     addParentNode node.__parentNode__ if node.__parentNode__
    #   addParentNode route

    #   if route.__prototype__.router && route.__prototype__.router.routes["/"]
    #     return