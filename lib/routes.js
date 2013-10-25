var path = require("path");
var fs = require("fs");
var _ = require("underscore");
var async = require("async");

//Allowed http request methods
var methods = {
  get:"get",
  post:"post",
  put:"put",
  del:"del",
  GET:"get",
  POST:"post",
  PUT:"put",
  DEL:"del"
};

// ******************** DANGER !!!!! ****************************************************
var wrap = {extend:function(module){return wrap}};
global.App = {
  View:wrap,
  Collection:wrap,
  Model:wrap,
  Router:wrap
}
// ************************************************************************

module.exports = function(app, config, coreLibs){

  var pageInitialize = async.simpleCompose(app.pluginsMap.pageInitialize);
  var requestMiddleware = async.simpleCompose(app.pluginsMap.httpRequestHandler);
  

  var defineRoute = function(page, route){ 

   
    app[methods[page.method]](route, function(req, res, next){
      var env = {
        page: page,
        route: route,
        req: req,
        res: res,
        next: next,
        error: function(){ res.error.apply(res, arguments); },
        render: function(dinamicAdd){
          var dyn = dinamicAdd || {};
          _.extend(env, dinamicAdd || {}, {
            javascripts: _.uniq( _.union(
              coreLibs,
              config.javascripts      || [],
              page.javascripts        || [],
              dyn.javascripts  || []
            )),
            styles: _.uniq( _.union(
              config.defaultStyles    || [],
              page.styles             || [],
              dyn.styles       || []
            )),
            config: JSON.stringify(_.extend(
              config.clientConfig     || {},
              page.config             || {},
              dyn.config       || {}
            )),
            services: _.uniq( _.union(
              config.services         || [],
              page.services           || [],
              dyn.services     || []
            )),
            url: function(str){
              if(!str || str=="/")  return "/"+page._pagename;
              else                  return "/"+page._pagename+"/"+str;
            }
          });
          
          requestMiddleware(env, function(err, env){

            if(err){
              env.req.end(500, err);
              return;
            }

            req.session.services = env.services;
            
            //OPTIMIZEME - check if there are any services changes from previous 
            //request and if not - do not save session
            req.session.save(function(session){ 
              res.end(page.template(env)); 
            });
          });
        }
      };


      if(page.handle && typeof page.handle == "function") page.handle.call(env, app);
      else env.render.apply(env);
    });
  };


  var go = function(page){

    var routePrefix = "";
    //Adding pagename as prefix to all routes if not home
    if(page._pagename != "home"){
      routePrefix = page._pagename;
      if(Array.isArray(page.route)){
        page.route=page.route.map(function(r){return routePrefix+r;});
      }
      else{
        page.route = ["/"+routePrefix+page.route];
      }
      page.route = page.route.map(function(r){return "/"+r.replace(/\/$/, "");});

    }

    // If page.app is defined - create bundle and add it to page javascripts
    if(page.app){

      var bundle = {
        load:         true,
        entryPoint:   path.normalize(page._dirname+"/"+page.app),
        mountPoint:   path.normalize("/apps/"+page._pagename+".js"),
        cache:        config.bundlesOptions.cache || true,
        watch:        config.bundlesOptions.watch || false,
        prepend: "App.settings.routePrefix=\""+routePrefix+"\";\n"
      };
      app.pluginsMap.bundles.push(bundle);
      var bundleRoute = path.normalize((config.bundlesOptions.prefix || "/bundles/")+bundle.mountPoint);
      if(Array.isArray(page.javascripts)){
        page.javascripts.push(bundleRoute);
      }
      else{
        page.javascripts = [bundleRoute];
      }

      // Extract routes from app router
      var approuter = require(bundle.entryPoint);
      page.route = _.keys(approuter.routes).map(function(route){
        if(route=="/"){
          return "/"+page._pagename;
        }
        else{
          return path.normalize("/"+page._pagename+"/"+route);
        }
      });

    }


    var pageInitialize = async.simpleCompose(app.pluginsMap.pageInitialize);


    if(Array.isArray(page.route)) page.route.forEach(function(r){ defineRoute(page, r); });
    else defineRoute(page, page.route);
  };

  //Loading all defined in pages folder
  var pagesPath = path.normalize(config.rootPath+(config.pages || "/pages"));
  if(config.rootPath && fs.existsSync(pagesPath) && fs.statSync(pagesPath).isDirectory()){
    var page_names = fs.readdirSync(pagesPath);
    var pages_objects = page_names
    //Filtering non js and non coffee files
    .filter(function(name){
      var fullPath = path.normalize(pagesPath+"/"+name);
      if(fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()){
        var ext = fullPath.split(".").pop();
        if(ext !="js" && ext!="coffee"){
          return false;
        }
      }   
      return true;  
    })
    .map(function(page_path){

      var mod = require(path.normalize(pagesPath+"/"+page_path));
      var fullPath = path.normalize(pagesPath+"/"+page_path);
      var path_arr = fullPath.split("/");
      if(fs.statSync(fullPath).isDirectory()){
        if(fs.existsSync(fullPath+"/index.js")){
          mod._filename = "index.js";
        }
        else if(fs.existsSync(fullPath+"/index.coffee")){
          mod._filename = "index.coffee";
        }
        else{
          throw new Error("Cannot load module "+ fullPath);
        }
        mod._dirname = fullPath;
      }
      else{
        mod._filename = path_arr.pop();
        mod._dirname = path_arr.join("/");
      }
      mod._pagename = page_path.replace(/(js|coffee)$/, "");
      return mod;
    })

    .forEach(function(mod){

      if(app.pluginsMap.pageLoaded.length>0){
        app.pluginsMap.pageLoaded.unshift(function(cb){cb(null, mod);});
        async.waterfall(app.pluginsMap.pageLoaded, function(err, page){
          if(err) throw new Error(err);
          go(page);
        });
      }
      else{
        go(mod);
      }

    });
  }
    
};
