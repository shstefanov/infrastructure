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


    //Creating the bundler
    var bundler = browserify({
      mount: bundle.mountPoint || bundle._filename, 
      watch: bundle.watch || config.bundlesOptions.watch,
      cache: bundle.cache || config.bundlesOptions.cache
    });

    var global_parse = config.bundleParse || {};
    var local_parse = bundle.parse || {};
    var x = _.extend({}, global_parse);
    var to_parse = _.extend(x, local_parse);

    // Expects config.bundleParse and bundle.parse to be something like:
    // {
    //  '.file_extension' : function(body, file){ 
    //       body is file content as string, 
    //       parse and return valid javascript code 
    //   },
    //   'other_extension': function(body, file){ ... }
    // }

    for(key in to_parse){
      bundler.register(ext, to_parse[key]);
    }

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
    console.log("????????????",bundle.name);

  });
};
