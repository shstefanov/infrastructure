browserify  = require "browserify"
_           = require "underscore"
fs          = require "fs"
path        = require "path"

defaultBundlePrefix = "/bundles/"

module.exports = (app, config)->
  
  if config.bundles
   bundles = require(config.bundles) 
  else 
    bundles = []
  
  bundles.concat app.pluginsMap.bundles

  #System core bundle
  app.pluginsMap.coreEntry.unshift __dirname+"/client/core.js"
  core_bundle =
    name:         "core" 
    load:         true
    entryPoint:   app.pluginsMap.coreEntry
    mountPoint:   "core.js"
    cache:        config.bundlesOptions.cache || true
    watch:        config.bundlesOptions.watch || false
    prepend: """
      var pluginsMap = {};
      window.addPlugin = function(name, fn_s){
        if(!pluginsMap[name]){ pluginsMap[name] = []; }
        if(Array.isArray(fn_s)){
          pluginsMap[name].concat(fn_s);
        }
        else{
          pluginsMap[name].push(fn_s);
        }
      };
    """

  bundles.unshift core_bundle

  coreInitialized = false

  #Add check for required fields and throw nice errors
  required =
    mountPoint:   true
    entryPoint:   true
  
  #Set up all defined bundles

  alignEntry = (entryPath)->
    if fs.statSync(entryPath).isDirectory()
      return entryPath+"/index.js"     if fs.existsSync(path.normalize(entryPath+"/index.js"))
      return entryPath+"/index.coffee" if fs.existsSync(path.normalize(entryPath+"/index.coffee"))
    else
      return entryPath

  
  createBundle = (bundle)->
    return if !bundle.load

    if Array.isArray bundle.entryPoint
      bundle.entryPoint = bundle.entryPoint.map alignEntry
    else
      bundle.entryPoint = alignEntry bundle.entryPoint
    # Check if entryPoint is directory

    Object.keys(required).forEach (field)->
      throw new Error "Required field "+field+" for bundle to be set up" if !bundle[field]

    bundleMountPoint = path.normalize((config.bundlesOptions.prefix || defaultBundlePrefix)+bundle.mountPoint)
    if bundle.name == "core" and !coreInitialized
      app.pluginsMap.coreLibs.push bundleMountPoint
      coreInitialized = true

    bundler = browserify 
      mount:        bundleMountPoint
      watch:        bundle.watch || config.bundlesOptions.watch
      cache:        bundle.cache || config.bundlesOptions.cache

    bundleParse = {}
    _.extend bundleParse, config.bundlesOptions.parse || {}
    
    # Deep extending bundles to override part of options
    if bundle.parse
      Object.keys(bundle.parse).forEach (key)->
        localBundleParse = bundle.parse[key]
        if !bundleParse[key]
          bundleParse[key] = localBundleParse
        else
          Object.keys(localBundleParse).forEach (option)->
            bundleParse[key][option] = localBundleParse[option]

    
    Object.keys(bundleParse).forEach (key)->
      parser = bundleParse[key]
      if typeof parser != "function"
        throw new Error("bundleParse for type "+key+" needs parse to be function with arguments (body, filepath)")
      else
        bundler.register key, parser

    #Adding the entry points of the bundle
    if Array.isArray bundle.entryPoint
      bundle.entryPoint.forEach (point)->
        bundler.addEntry point
    else
      bundler.addEntry bundle.entryPoint

    #Adding code prepends if any
    prepends = ""

    if bundle.prepend
      prepends+="\n\n"+bundle.prepend+"\n\n"

    if prepends
      bundler.prepend bundle.prepend

    #Add here checks for cache and write cache file logic
    #bundler.bundle() returns the bundle string
    
    app.use(bundler)

  bundles.forEach createBundle

  app.pluginsMap.bundles = {push: createBundle}
