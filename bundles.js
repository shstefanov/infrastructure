var _ = require("underscore");
var path = require("path");
var browserify = require(__dirname+"/modified_modules/browserify");

var helpers = require("./helpers");

module.exports = function(app, config, bundles){

  var bundles = helpers.loadDirAsArray(config.bundlesFolder);

  //Client initializer bundle 
  //With browserify modification to include files runtime from given strings
  //Needs all directory to be loaded recursively in separate file

  //System core bundle
  bundles.push({
    bundleName:"core", 
    entryPoint:  __dirname+"/client/core.js",
    mountPoint : "/core.js",
    cache: config.bundles.cache,
    watch: config.bundles.watch
  });

  //Set up javascript bundles
  bundles.forEach(function(bundle){

    var parts = bundle.entryPoint.split("/");
    parts.pop();
    var path = parts.join("/");
    console.log("joined bundle path", path);

    var bundleDirTree = helpers.loadDirTreeAsArray(path, function(files){
      //Creating the bundler
      var bundler = browserify({
        mount: bundle.mountPoint || bundle._filename,
        watch: bundle.watch || config.bundles.watch,
        cache: bundle.cache || config.bundles.cache
      });
      bundler.addEntry(bundle.entryPoint);
      bundler.prepend( "var __filelist = "+JSON.stringify(files)+";" );
      bundler.register(".jade", helpers.plainTextContentWrapper);
      files.forEach(function(file){
        bundler.require(file);
      });
      app.use(bundler);
    });
  });

};
