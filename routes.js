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
  "/js/jquery.js",
  "/js/jade.js",
  "/js/underscore.js",
  "/js/backbone.js",
  "/js/less.js",
  "/js/core.js"
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
        req.session.modelServices = {};
        req.session.services = {};

        var error = function(message){
          this.req.error(500, message);
        }

        var render = function() {
          
          //Setting up javascripts
          var coreJavascripts = coreLibs;
          var configJavascripts = config.defaultJavascripts || [];
          var additionalJavascripts = this.javascripts || [];
          var pageJavascripts = page.javascripts || [];
          var allJavascripts = _.union(
            coreJavascripts,
            configJavascripts,
            additionalJavascripts,
            pageJavascripts
          );

          //Setting up styles
          var configStyles = config.defaultStyles || [];
          var additionalStyles = this.styles || [];
          var pageStyles = page.styles || [];
          var allStyles = _.union(
            configStyles,
            additionalStyles,
            pageStyles,
          );
          var lessStyles = [];
          var cssStyles  = [];


          allStyles.forEach(function(style){
            var ext = style.split(".").pop();
            if(ext == "less"){
              lessStyles.push(style);
            }
            if(ext = "css"){
              cssStyles.push(ext);
            }
          });

          //Setting up config
          var configConfig = config.clientConfig || {};
          var additionalConfig = this.config || {};
          var pageConfig = page.config || {};
          var mergedConfig = _.extend(
            configConfig,
            additionalConfig,
            pageConfig
          );

          //Setting up services
          var configServices = config.defaultServices || [];
          var additionalServices = this.services || [];
          var pageServices = page.services || [];
          var allServices = _.union(
            configServices,
            additionalServices,
            pageServices
          );
          
          //Rendering with template engine - jade
          res.render("init.jade", {
            title: this.title,
            javascripts:allJavascripts, 
            less: lessStyles
            css: cssStyles
            config:JSON.stringify(pageConfig),  //Page config
            services: allServices,
            bodyJavascript:this.bodyJavascript || ""
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
            bodyJavascript: page.bodyJavascript
            req: req,
            res: res,
            next: next,
            render: render,
            error: error
          };

          page.callback.apppy(current_page, app);
        }
        //Else - run the page rendering
        else render.apply(page);

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


