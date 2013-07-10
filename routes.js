var _ = require("underscore");
var fs = require("fs");
var path = require('path');
var helpers = require("./helpers");

//var Backbone = require("backbone");
//var raw_head_template = fs.readFileSync(__dirname+"/init.jade");

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
  "/socket.io/socket.io.js",
  "http://code.jquery.com/jquery-1.9.1.min.js", //?? TODO - try loading them from npm
  "http://code.jquery.com/jquery-migrate-1.1.1.min.js", //?? TODO - try loading them from npm
  "/core-libs/underscore.js", //?? TODO - try loading them from npm
  "/core-libs/backbone.js", //?? TODO - try loading them from npm
];

module.exports = function(app, config, pluginsMap){
  
  //Corescripts plugin-point
  pluginsMap.corelibs.forEach(function(corescript){
    coreLibs.push(corescript);
  });

  //Loading all defined in pages folder page definitons
  var routers = helpers.loadDirAsObject(config.routers);
  var salam = [];
  Object.keys(routers).forEach(function(key){
   
    var router = routers[key];
    var method = methods[router.method];
    if(!method){
      throw new Error('Http method '+method+' not allowed'); 
    }
    router.method = method;
    router.javascripts = coreLibs

    var handler =  new app.Router(router, app);

  });

  //Breaking for development 
  return; 

  head_template = jade.compile(raw_head_template);
  //Setting up server to serve each of them
  pages.forEach(function(page){
    console.log("parsing page: ", page.route);
    var views = {};
    var layout = undefined;
    var homeTemplate = undefined;

    var allViews = page.views || {}
    var viewWrappers = {};

    var initializeViews = function(){
      if(page.layout){ allViews.layout = page.layout  }
      if(page.views){ _.extend(allViews, page.views) }
      Object.keys(allViews).forEach(function(key){
        if(typeof allViews[key] == "string"){
          var path = allViews[key];
          var wrapper = "<div></div>";
        }
        else if(typeof allViews[key] == "object"){
          var path = allViews[key].path;
          var wrapper = jade.compile(allViews[key].wrapper || "div")();
          var getter = allViews[key].getter
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
    };
    initializeViews();
    var defineRoute = function(route){ //push - true, false

      var target = viewWrappers[route];
      var view = views[route];
      
      //??page.route
      app[methods[page.method]](route, function(req, res, next){

        if(process.env.MODE == 'dev'){initializeViews();}

        //Reset user's socket services
        req.session.services = [];

        var error = function(message){
          this.req.error(500, message);
        }

        var render = function(current_page) {
          
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
          var additionalConfig = current_page.config || {};
          var mergedConfig = {};
          _.extend(
            mergedConfig,
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
          
          current_page.req.session.services = availableServices;
          var self = this;
          current_page.req.session.save(function(session){

            var vars = {
              t: req.i18n.t,
              title: self.title,
              javascripts:allJavascripts, 
              less: less,
              css: css,

              views: viewWrappers,
              target: target,
              lng:req.lng,
              utils:app.utils,
              config:mergedConfig,

              renderedData: undefined
            };

            vars.stringifiedConfig = JSON.stringify(mergedConfig);
            vars.locals = vars;

            var renderView = function(){
              if(view){
                if(view.getter){
                  view.getter.call(current_page, app, function(data){
                    _.extend(vars, data);
                    d = (data.collection || data.model);
                    if(d){vars.renderedData = JSON.stringify(d.toJSON());}
                    else{vars.renderedData = 'true'}
                    res.send(head_template(vars));
                  });        
                }
                else{
                  res.send(head_template(vars));
                }
              }
              else{
                res.send(head_template(vars));
              }
            };

            var renderLayout = function(){
              if(views.layout.getter){
                views.layout.getter.call(current_page, app, function(data){
                  _.extend(vars, data);
                  renderView();
                });
              }
              else{               renderView();   }
            };
            
            if(views.layout){     renderLayout(); }
            else{                 renderView();   }

          });
          
        };

        //If there is callback in page definition
        var current_page = {
          title: page.title,
          javascripts: [],
          styles: [],
          services:[],
          data:{},
          config:{},
          
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


