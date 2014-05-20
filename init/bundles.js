
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

  var global_vars = "" , local_vars = "var ";
  var _vars = "App = {}, Backbone = undefined; Infrastructure = {}, app = undefined, jade = undefined, io = undefined, socket = undefined, $ = undefined; _ = undefined";
  var vars_prepend = (config.debug? global_vars : local_vars)+_vars+"\n"+(config.globals || "");
  var new_line = "\n";

  env.registerBundle = function(page){
    var root = page.root, filepath = page.app;
    var entryPoint = path.join(env.config.rootDir, env.config.bundles, filepath);
    var mountPoint = path.join(_bundles, root+js_ext);
    mountPoint = mountPoint.replace(backslash_repl_re, _slash);
    var bundler = browserify({
      mount:        mountPoint,
      watch:        config.bundlesOptions.watch,
      cache:        config.bundlesOptions.cache
    });
    bundler.register(jade_ext, parse_jade);
    
    for(key in page){
      key.indexOf(".")===1 && bundler.register(key, page[key]);
    }
    
    vars_prepend+="\nvar settings = "+JSON.stringify(page.settings)+";\n";
    
    bundler.prepend( vars_prepend );

    page.settings.root = root;
    page.bundler = bundler;
    // Adding the core app
    bundler.addEntry(path.join(__dirname, "../client/app.js"));

    bundler.addEntry(entryPoint);
    if(config.bundlesOptions.cache === true){
      var bundlePath = path.join(config.rootDir, mountPoint);
      console.log("Writing bundle: ", bundlePath);
      fs.writeFileSync(bundlePath, bundler.bundle());
    }
    else{
      app.use(bundler);
    }
    return mountPoint;
  }

  cb(null);

}