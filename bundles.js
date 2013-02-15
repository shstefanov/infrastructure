var browserify = require("browserify");
var helpers = require("./helpers");

//Called in index.js
module.exports = function(app, config){

  var bundles = helpers.loadDirAsArray(config.bundlesFolder);

  //System core bundle
  bundles.unshift({
    bundleName:"core", 
    entryPoint:  __dirname+"/client/core.js",
    mountPoint : "/core.js",
    cache: config.bundles.cache,
    watch: config.bundles.watch,
    prepend: "var __models = {}"
  });

  //Set up all defined bundles
  bundles.forEach(function(bundle){

    //Creating the bundler
    var bundler = browserify({
      mount: bundle.mountPoint || bundle._filename, 
      watch: bundle.watch || config.bundles.watch,
      cache: bundle.cache || config.bundles.cache
    });
    
    //Setting bundle's start point
    bundler.addEntry(bundle.entryPoint);

    //Adding code prepends if any
    if(bundle.prepend){
      bundler.prepend(bundle.prepend);
      delete bundle.prepend;
    }
    //Registering template files, to be included in the bundle
    bundler.register(".jade", helpers.plainTextContentWrapper);

    //Giving the bundle to express to use it as middleware
    app.use(bundler);
  });


};
