var browserify = require("browserify");
var _ = require("underscore");
var helpers = require("./helpers");


//Called in index.js
module.exports = function(app, config, pluginsMap){

  var bundles = require(config.bundles);

  //System core bundle
  core_bundle = {
    load:true,
    name:"core", 
    entryPoint:  __dirname+"/client/core.js",
    mountPoint : "/core.js",
    cache: config.bundlesSettings.cache || false,
    watch: config.bundlesSettings.watch || true
  };

  bundles.unshift(core_bundle);

  //Set up all defined bundles
  bundles.forEach(function(bundle){
    if(!bundle.load) return;
    
    //Add check for required fields and throw nice errors
    var required = {
      mountPoint:true,
      entryPoint:true
    };
    Object.keys(required).forEach(function(field){
      if(!bundle[field]){throw new Error("Bundle with name "+bundle.name+" requires field "+field+" to be set");}
    });

    //Creating the bundler
    var mountPrefix = config.bundlesPrefix || "/bundles";
    bundleMountPoint = mountPrefix+bundle.mountPoint;
    if(bundle.name == "core"){
      pluginsMap.corelibs.unshift(bundleMountPoint);
    }
    var bundler = browserify({
      mount: bundleMountPoint, 
      watch: bundle.watch || config.bundlesSettings.watch,
      cache: bundle.cache || config.bundlesSettings.cache
    });

    var bundleParse = {};
    _.extend(bundleParse, config.bundleParse || {});
    
    // Deep extending bundles to override part of options
    if(bundle.bundleParse){
      Object.keys(bundle.bundleParse).forEach(function(key){
        localBundleParse = bundle.bundleParse[key];
        if(!bundleParse[key]){
          bundleParse[key] = localBundleParse;
        }
        else{
          Object.keys(localBundleParse).forEach(function(option){
            bundleParse[key][option] = localBundleParse[option];
          });
        }
      });
    }
    
    Object.keys(bundleParse).forEach(function(key){
      var parser = bundleParse[key];
      if(parser.prepend){
        bundler.register(key, function(body, filepath){
          var string = parser.parse(body, filepath);
          var result =  (parser.prepend || "")+"\n\n"+string+"\n\n"+(parser.append || "");
          return result;
        });
      }
      else{
        if(typeof parser.parse != "function"){
          throw new Error("bundleParse for type "+key+" needs parse to be function with arguments (body, filepath)")
        }
        else{
          bundler.register(key, parser.parse);
        }
      }
    });

    //Adding the entru points of the bundle
    if(Array.isArray(bundle.entryPoint)){
      bundle.entryPoint.forEach(function(point){
        bundler.addEntry(point);
      }); 
    }
    else{
      bundler.addEntry(bundle.entryPoint);
    }

    //Adding code prepends if any
    var prepends = "";
    if(config.bundlePrepend){
      prepends+="\n\n"+config.bundlePrepend+"\n\n";
    }
    if(bundle.prepend){
      prepends+="\n\n"+bundle.prepend+"\n\n";
    }
    if(prepends){
      bundler.prepend(bundle.prepend);
    }

    //Add here checks for cache and write cache file logic
    //bundler.bundle() returns the bundle string

    if(bundle.callback && typeof bundle.callback == "function"){
      bundle.callback(bundler, app);
    }
    else{
      app.use(bundler);
    }

  });
};
