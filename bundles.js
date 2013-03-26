var browserify = require("browserify");
var _ = require("underscore");
var helpers = require("./helpers");


//Called in index.js
module.exports = function(app, config){

  var bundles = require(config.bundles);

  //System core bundle
  bundles.unshift({
    load:true,
    bundleName:"core", 
    entryPoint:  __dirname+"/client/core.js",
    mountPoint : "/bundles/core.js",
    cache: config.bundlesOptions.cache,
    watch: config.bundlesOptions.watch
    //prepend: "var __models = {};"
  });

  //Set up all defined bundles
  bundles.forEach(function(bundle){
    if(!bundle.load) return;
    console.log(bundle.name);

    var rawFilesExtensions = _.union(config.bundlesRawFiles, bundle.raw || []);

    //Creating the bundler
    var bundler = browserify({
      mount: bundle.mountPoint || bundle._filename, 
      watch: bundle.watch || config.bundlesOptions.watch,
      cache: bundle.cache || config.bundlesOptions.cache
    });
    rawFilesExtensions.forEach(function(ext){
      bundler.register(ext, helpers.plainTextContentWrapper);
    });
    bundler.addEntry(bundle.entryPoint);
    //bundler.require(filename);
    
    //Adding code prepends if any
    if(bundle.prepend){
      bundler.prepend(bundle.prepend);
      delete bundle.prepend;
    }

    if(bundle.callback && typeof bundle.callback == "function"){
      bundle.callback(bundler, app);
    }
    else{
      app.use(bundler);
    }

  });
};
