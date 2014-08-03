
var browserify      = require("browserify");
var path            = require("path");
var fs              = require("fs");
var jade            = require("jade");
var beautify        = require('js-beautify').js_beautify;

module.exports = function(cb){

  var env = this;

  var config = env.config;
  var app = env.app;

  var jade_ext = ".jade";
  var html_ext = ".html";
  var self_base = "var buf = []";
  var self_repl = self_base+",self=this";
  var f_templ = "function template";
  var f_templ_repl = "\n\nmodule.exports = function";
  var require_locals = "require = locals_.require";
  var require_locals_repl = "_require = locals_.require";
  var self_locals = "self = locals_.self";
  var self_locals_repl = "_self = locals_.self";
  var _bundles = "/bundles";
  var js_ext = ".js";
  var backslash_repl_re = /\\/g;
  var _slash = "/";
  var _utf8 = "utf8";

  var indent_size = 2;

  var parse_jade = function(body, filepath){
    var code =  jade.compileClient(fs.readFileSync(filepath, _utf8).toString(), {
      debug: false,
      filename: filepath
    }).toString();
    var code = beautify(code, { indent_size: indent_size });
    
    return code = code
    .replace(f_templ, f_templ_repl)
    .replace(require_locals, require_locals_repl)
    .replace(self_locals, self_locals_repl)
    .replace(self_base, self_repl);
    
    // // https://github.com/mishoo/UglifyJS2
    // if(!config.debug === true){
    //   var debug_stripped = code.replace(/(debug\.shift|debug\.unshift|jade\.rethrow).+;/gm, "");
    //   code = UglifyJS.minify(debug_stripped, {fromString: true}).code;
    // }
  };

  var parse_html = function(body, filepath){
    var js_html = "";

    js_html = body.replace(/"/g, "'");



    console.log(js_html);
    return "module.exports = '<div>I'm not real html</div>';";

  }

  

  var bundleBase;
  function getBundleBase(base){

    if(base === "backbone"){
      return "backbone";
    }
    else if(base === "angular"){
      return "angular";
    }
    else{
      return undefined;
    }

  }

  bundleBase = getBundleBase(config.bundlesOptions.base) || "none";


  var global_vars = "" , local_vars = "var ";
  var backbone_vars = "App = {}, Backbone = undefined; Infrastructure = {}, app = undefined, jade = undefined, io = undefined, socket = undefined, $ = undefined; _ = undefined";
  var angular_vars = "";
  var new_line = "\n";




  env.registerBundle  = function(page){

    var pageBundleBase = getBundleBase(page.base) || bundleBase;
    
    var root          = page.root, filepath = page.app;
    var entryPoint    = path.join(
      config.rootDir || process.cwd(), 
      config.bundles, 
      page.app
    );
    
    
    var mountPoint    = path.join(config.bundlesOptions.prefix || _bundles,  page.app);
    mountPoint        = mountPoint.replace(backslash_repl_re, _slash);
    
    var    bundler    = browserify({
      mount:    mountPoint,
      watch:    config.bundlesOptions.watch,
      cache:    config.bundlesOptions.cache
    });
    
    if(pageBundleBase==="backbone") bundler.register(jade_ext, parse_jade);
    if(pageBundleBase==="angular")  bundler.register(html_ext, parse_html);
    
    for(key in page) key.indexOf(".")===0 && bundler.register(key, page[key]);

    var vars_prepend;
    if(pageBundleBase==="backbone")
      vars_prepend = (config.debug? global_vars : local_vars)+backbone_vars+"\n"+(config.globals || "");
    else if(pageBundleBase==="angular")
      vars_prepend = (config.debug? global_vars : local_vars)+angular_vars+"\n"+(config.globals || "");
    else 
      vars_prepend = config.globals? (config.debug? global_vars : local_vars)+(config.globals || "") : "";
    var additional_prepend="\nvar settings = "+JSON.stringify(page.settings||{})+";\n";

    bundler.prepend( vars_prepend+additional_prepend );

    page.bundler = bundler;
    page.apps = page.apps?page.apps.concat([mountPoint]):[mountPoint];
    // Adding the core app
    if(pageBundleBase !== "none"){
      if(pageBundleBase==="backbone")
        bundler.addEntry(path.join(__dirname, "../client/backbone/app.js"));
      else if(pageBundleBase==="angular")
        bundler.addEntry(path.join(__dirname, "../client/angular/app.js"));
    }
    
    if(config.bundlesOptions.plugins) config.bundlesOptions.plugins.forEach(function(plugin){
      bundler.addEntry(plugin);
    });

    bundler.addEntry(entryPoint);
    if(config.bundlesOptions.cache === true){
      var bundlePath = path.join(config.rootDir||process.cwd(), mountPoint);
      console.log("Writing bundle: ", bundlePath);
      //fs.writeFileSync(bundlePath, bundler.bundle());
    }
    else{
      app.use(bundler);
    }
    return bundler;
  }

  cb && cb(null);

}