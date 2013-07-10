path = require "path"
fs = require "fs"

#Check valid router
# init: (router)->
#   if typeof @routes != "object" || Object.keys(@routes).length==0
#     throw new Error('Router '+@root+' don\'t have any routes')
#   if typeof @views != "object" || Object.keys(@views).length==0
#     throw new Error('Router '+@root+' don\'t have any views')

# #Extending View class
# extendClass(child, Parent): ->
#   class Child extends Parent
#   for key, val of child
#     Child::[key] = val
#   return Child

class Router
  constructor: (options, @app, root)->
    {@routes, @views, @method, @layout } = options
    #@app[@method] @roots.join("")+route, (req,res,next)=>
    
module.exports = Router
