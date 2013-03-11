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
  "/i18next/i18next.js",
  "/socket.io/socket.io.js",
  "/core-libs/jquery.js",
  "/core-libs/jade.js",
  "/core-libs/underscore.js",
  "/core-libs/backbone.js",
  "/core-libs/less.js",
  "/bundles/core.js"
];

module.exports = function(app, config){

  //Loading all defined in pages folder page definitons
  var pages = helpers.loadDirAsArray(config.routesFolder);
  
  //Setting up server to serve each of them
  pages.forEach(function(page){

    var defineRoute = function(route){ //push - true, false
      
      var pushState = route.indexOf(":") > -1;

      app[methods[page.method]](page.route, function(req, res, next){

        //Reset user's socket services
        req.session.services = [];

        var error = function(message){
          this.req.error(500, message);
        }

        var render = function() {
          
          //Setting up javascripts
          var coreJavascripts = coreLibs;
          var configJavascripts = config.defaultJavascripts || [];
          var pageJavascripts = page.javascripts || [];
          var additionalJavascripts = this.javascripts || [];
          var allJavascripts = _.union(
            coreJavascripts,
            configJavascripts,
            pageJavascripts,
            additionalJavascripts
          );

          //Setting up styles
          var configStyles = config.defaultStyles || [];
          var pageStyles = page.styles || [];
          var additionalStyles = this.styles || [];
          var allStyles = _.union(
            configStyles,
            pageStyles,
            additionalStyles
          );

          var less = [];
          var css  = [];
          allStyles.forEach(function(style){
            var ext = style.split(".").pop();
            if(ext == "less"){
              less.push(style);
            }
            else if(ext = "css"){
              css.push(style);
            }
          });

          //Setting up config
          var configConfig = config.clientConfig || {};
          var pageConfig = page.config || {};
          var additionalConfig = this.config || {};
          var mergedConfig = _.extend(
            configConfig,
            pageConfig,
            additionalConfig
          );

          //Setting up services
          var configServices = config.defaultServices || [];
          var pageServices = page.services || [];
          var additionalServices = this.services || [];
          var allServices = _.union(
            configServices,
            pageServices,
            additionalServices
          );
          this.req.session.services = allServices;
          this.req.session.save(function(session){

            //Rendering with template engine - jade
            res.render("init.jade", {
              title: this.title,
              javascripts:allJavascripts, 
              less: less,
              css: css,
              config:JSON.stringify(pageConfig),  //Page config
              services: JSON.stringify(allServices),
              bodyAdd:this.bodyAdd || ""
            });
            
          });

          
        };

        //If there is callback in page definition
        if(page.callback && typeof page.callback == "function"){
          // title
          // javascripts
          // styles
          // services

          var javascripts = page.javascripts || [];
          var styles = page.styles || [];
          var services = page.services || [];

          var current_page = {
            title: page.title,
            javascripts: [],
            styles: [],
            services:[],
            bodyJavascript: page.bodyJavascript,
            req: req,
            res: res,
            next: next,
            render: render,
            error: error
          };

          page.callback.call(current_page, app);
        }
        //Else - run the page rendering
        else render.call(current_page);

      });
    };


    if(typeof page.route == "string"){
      defineRoute(page.route);
      return;
    }
    if(Array.isArray(page.route)){
      page.route.forEach(function(route){
        defineRoute(route);
      });
      return;
    }

  });
};


