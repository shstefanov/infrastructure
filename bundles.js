var browserify = require("browserify");
var _ = require("underscore");
var helpers = require("./helpers");


//Called in index.js
module.exports = function(app, config){

  var bundles = require(config.bundles);

  //System core bundle
  bundles.unshift({
    load:true,
    name:"core", 
    entryPoint:  __dirname+"/client/core.js",
    mountPoint : "/bundles/core.js",
    cache: config.bundlesSettings.cache || false,
    watch: config.bundlesSettings.watch || true
    //prepend: "var __models = {};"
  });

  //Set up all defined bundles
  bundles.forEach(function(bundle){
    if(!bundle.load) return;
    
    //Add check for required fields and throw nice errors

    //Creating the bundler
    var bundler = browserify({
      mount: bundle.mountPoint || bundle._filename, 
      watch: bundle.watch || config.bundlesSettings.watch,
      cache: bundle.cache || config.bundlesSettings.cache
    });

    var bundleParse = {};
    _.extend(bundleParse, config.bundleParse || {});
    // Deep extending bundles to ovverride local options
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
        bundler.register(key, parser.parse);
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
