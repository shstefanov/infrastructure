browserify  = require "browserify"
_           = require "underscore"
helpers     = require "./helpers"
async       = require "async"

defaultBundlePrefix = "/bundles/"

module.exports = (app, config, pluginsMap)->
  
  if config.bundles
   bundles = require(config.bundles) 
  else 
    bundles = []
  
  bundles.concat pluginsMap.bundles

  #System core bundle
  core_bundle =
    name:         "core" 
    load:         true
    entryPoint:   __dirname+"/client/core.js"
    mountPoint:   "core.js"
    cache:        config.bundlesOptions.cache || true,
    watch:        config.bundlesOptions.watch || false

  bundles.unshift core_bundle

  coreInitialized = false

  #Add check for required fields and throw nice errors
  required =
    mountPoint:   true
    entryPoint:   true
  
  #Set up all defined bundles
  bundles.forEach (bundle)->
    return if !bundle.load
    
    Object.keys(required).forEach (field)->
      throw new Error "Required field "+field+" for bundle to be set up" if !bundle[field]

    bundleMountPoint = (config.bundlesOptions.prefix || defaultBundlePrefix)+bundle.mountPoint
    if bundle.name == "core" and !coreInitialized
      pluginsMap.coreLibs.push bundleMountPoint
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
