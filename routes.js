var _ = require("underscore");
var helpers = require("./helpers"); 

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

var coreLibs = [
  "/socket.io/socket.io.js"
];

module.exports = function(app, config){

  var defineRoute = function(page, route){ 
    app[methods[page.method]](route, function(req, res, next){

      var connection = {
        title: page.title,
        javascripts: [],
        styles: [],
        services:[],
        req: req,
        res: res,
        next: next,
        render: render,
        error: function(){ res.error.apply(res, arguments); };
        render: function(){
          
          var locals = {
            javascripts: _.uniq( _.union(
              coreLibs,
              config.javascripts      || [],
              page.javascripts        || [],
              connection.javascripts  || []
            )),
            styles: _.uniq( _.union(
              config.defaultStyles    || [],
              page.styles             || [],
              connection.styles       || []
            )),
            config: _.extend(
              config.clientConfig     || {},
              page.config             || {},
              connection.config       || {}
            ),
            services: _.uniq( _.union(
              config.services         || [],
              page.services           || [],
              connection.services     || []
            ))
          };
          
          //TODO - add pluginsMap "httpLocals" here

          req.session.services = connection.services;
          //OPTIMIZEME - check if there are any services changes from previous 
          // and avoid saving
          //request and if not - do not save session
          req.session.save(function(session){ res.send(page.template(locals)); });
        }
      };

      if(page.handle && typeof page.handle == "function") page.handle.call(connection, app);
      else connection.render.apply(connection);
    });
  };

  //Loading all defined in pages folder page definitons
  var pages = helpers.loadDirAsArray(config.routes);
  
  //Setting up server to serve each of them
  pages.forEach(function(page){
    if(Array.isArray(page.route)) page.route.forEach(function(r){ defineRoute(page, r); });
    else defineRoute(page, page.route) 
  });
    
};
