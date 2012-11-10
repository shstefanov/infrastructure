var _ = require("underscore");
var path = require("path");
var browserify = require(__dirname+"/modified_modules/browserify");

var helpers = require("./helpers");

module.exports = function(app, config, bundles){

  var bundles = helpers.loadDirAsArray(config.bundlesFolder);


  //System core bundle
  bundles.push({
    bundleName:"core", 
    entryPoint:  __dirname+"/client/core.js",
    mountPoint : "/core.js",
    cache: config.bundles.cache,
    watch: config.bundles.watch
  });

  //Set up all defined bundles
  bundles.forEach(function(bundle){

    //Setting bundle root folder
    var parts = bundle.entryPoint.split("/");
    parts.pop();
    var _path = parts.join("/");

    //Loadin all files (recursively) in bundle's home folder
    var bundleDirTree = helpers.loadDirTreeAsArray(_path, function(files){
      //Replacing bundle's homefolder path with .
      var filelist = _.map(files, function(file){
        return file.replace(_path, ".");
      });

      //get bundle's local path and removing it from list of all files
      var ep = bundle.entryPoint.replace(_path, ".");
      var list = _.without(filelist,ep);

      //Creating the bundler
      var bundler = browserify({
        mount: bundle.mountPoint || bundle._filename, 
        watch: bundle.watch || config.bundles.watch,
        cache: bundle.cache || config.bundles.cache
      });
      
      //Setting bundle's start point
      bundler.addEntry(bundle.entryPoint);

      //Adding array with local paths of all files in bundle's derectory tree
      bundler.prepend( "var __filelist = "+JSON.stringify(list)+";var files; var RM;" );

      //Registering template files, to be included in the bundle
      bundler.register(".jade", helpers.plainTextContentWrapper);

      //Adding each file to the bundle
      files.forEach(function(file){
        bundler.require(path.normalize(file));
      });

      //Giving the bundle to express to use it as middleware
      app.use(bundler);
    });
  });

};
