var browserify = require("node-browserify");
var _ = require("underscore");
var helpers = require("./helpers");


//Called in index.js
module.exports = function(app, config){

  //Array of bundles objects
  var bundles = require(config.bundles);
  app.get("/bundles/core.js", function(req, res, next){

  });

  //Using new browserify

  //System core bundle
  // bundles.unshift({
  //   load:true,
  //   bundleName:"core", 
  //   entryPoint:  __dirname+"/client/core.js",
  //   mountPoint : "/bundles/core.js",
  //   cache: config.bundlesOptions.cache,
  //   watch: config.bundlesOptions.watch
  //   //prepend: "var __models = {};"
  // });

};
