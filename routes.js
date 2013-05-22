var _ = require("underscore");
var jade = require("jade");
var fs = require("fs");
var Backbone = require("backbone");

var raw_head_template = fs.readFileSync(__dirname+"/init.jade");
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
  "http://code.jquery.com/jquery-1.9.1.min.js",
  "http://code.jquery.com/jquery-migrate-1.1.1.min.js",
  "/core-libs/jade.js",
  "/core-libs/underscore.js",
  "/core-libs/backbone.js",
  "/core-libs/less.js",
  "/bundles/core.js"
];

module.exports = function(app, config){

  head_template = jade.compile(raw_head_template);



  //Loading all defined in pages folder page definitons
  var pages = helpers.loadDirAsArray(config.routesFolder);
  
  //Setting up server to serve each of them
  pages.forEach(function(page){
    console.log("parsing page: ", page.route);
    var views = {};
    var layout = undefined;
    var homeTemplate = undefined;

    var allViews = page.views || {}
    var viewWrappers = {};

    var initializeViews = function(){
      
      if(page.layout){
        allViews.layout = page.layout
      }
      if(page.home){
        allViews.home = page.home
      }

      if(page.views){
        
        Object.keys(allViews).forEach(function(key){
          if(typeof page.views[key] == "string"){
            var path = page.views[key];
            var wrapper = "<div></div>";
          }
          else if(typeof page.views[key] == "object"){
            var path = page.views[key].path;
            var wrapper = jade.compile(page.views[key].wrapper || "div")();
            console.log("here----------------------->");
            var getter = page.views[key].getter
          }
          else{
            return;
          }
          views[key] = {
            tmpl: jade.compile(fs.readFileSync(config.templatesFolder+path)),
            wrapper: wrapper,
            getter:getter
          };
          viewWrappers[key] = function(data){
            if(!views[key]){ return "No template - "+key; }
            var html = views[key].tmpl(data);
            return views[key].wrapper.replace("><", ">"+html+"<");
          };
        });
      }

    };
    initializeViews();
    var defineRoute = function(route){ //push - true, false

      if(route == "/"){
        var target = viewWrappers.home;
        var view = views.home;
      }
      else{
        var target = viewWrappers[route];
        var view = views[route];
      }
      //??page.route
      app[methods[page.method]](route, function(req, res, next){

        if(process.env.MODE == 'dev'){initializeViews();}

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
          var _serv = _.union(
            configServices,
            pageServices
          );
          var allServices = _.union(
            _serv,
            additionalServices
          )
          var availableServices = [];
          allServices.forEach(function(serviceName){
            if(app.services[serviceName])
              availableServices.push(serviceName);
          });
          
          this.req.session.services = availableServices;
          var self = this;
          this.req.session.save(function(session){

            var vars = {
              t: req.i18n.t,
              title: self.title,
              javascripts:allJavascripts, 
              less: less,
              css: css,

              views: viewWrappers,
              target: target,
              target_data: {}
            };

            vars.config = JSON.stringify(mergedConfig);
            vars.local = vars;
            
            if(view && view.getter){
              view.getter(function(app, data){
                vars.target_data = data;
                res.send(head_template(vars));
              });
            }
            else{
              res.send(head_template(vars));
            }
          });
        };

        //If there is callback in page definition
        var current_page = {
          title: page.title,
          javascripts: [],
          styles: [],
          services:[],
          data:{},
          
          req: req,
          res: res,
          next: next,
          render: render,
          error: error
        };

        if(page.callback && typeof page.callback == "function"){
          page.callback.call(current_page, app);
        }
        //Else - run the page rendering
        else render.call(current_page);

      });
    };

    var toBind = [];
    if(typeof page.route == "string"){
      toBind.push(page.route);
    }
    if(Array.isArray(page.route)){
      toBind = page.route;
    }
    if(page.views){
      for(key in page.views){
        toBind.push(key);
      }
    }
    toBind.forEach(function(route){
      defineRoute(route);
    });

  });
};


