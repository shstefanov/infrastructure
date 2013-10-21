

module.exports = (router, cb)->
  $(document).ready ->
    #Adding routePrefix to routes
    
    if App.settings.routePrefix
      new_routes = {}
      for route,method of router.routes
        if !route || route=="/"
          new_route = App.settings.routePrefix
        else
          new_route = App.settings.routePrefix+"/"+route
        new_routes[new_route] = method
        if(!/\/$/.test(new_route))
          new_routes[new_route+"/"] = method

      router.routes = new_routes

    Router = App.Router.extend(router)
    app.router = new Router()
    cb()
