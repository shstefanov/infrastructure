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
      
      #node.__instance__   = new App.View view
      node.__prototype__  = App.View.extend view
      node.__props__  = view
      
      node.__info__ =
        path: full_path
        fragment: fragment.replace /\//g, ""
      
      routes_collection.push node
      
      if view.router && view.router.routes
        for route, _view of view.router.routes
          buildRoute _view, route, node, full_path

    buildRoute layout, (layout.router.root || "/" ), routes_tree_root, "" if layout.router

    # console.log routes_collection
    routes_collection.forEach (node)->
      map = []

      addParentNode = (node)->
        map.unshift node
        addParentNode node.__parentNode__ if node.__parentNode__
      addParentNode node

      # console.log path.normalize(_.pluck(_.pluck( map, "__info__"), "path").join(""))
      if node.__prototype__.prototype.router && node.__prototype__.prototype.router.routes["/"]
        return
      console.log node.__info__.path
      #TODO - 

      # variant 1
      # 1 - build router object with routes:{[node.__info__.path]: _uniqueId('view')}
      # 2 - router.prototype[_uniqueId('view')] = _.bind(node, function_defined_outside_scope)
      # 3 - the function must fetch data from some method, must recieve params argument if any
      # 4 - create a instance
      # 5 - append to parent node

      # variant 2
      # 1 - find top-level parent that is not rendered
      # 2 - fetch the data and create instance
      # 3 - push instance to array
      # 4 - cycle array with while(array.length){view = array.pop();_.last(array).append(view);}