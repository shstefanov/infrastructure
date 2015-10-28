// Backbone router needs jQuery to select 'window' and to attach 2 events to it
// Creating simple mockup

var Backbone               = require("backbone");
var Class                  = require("../Class");

var jQueryMockup = {
  on: function(event, handler){
    this.el.addEventListener(event, handler);
    return jQueryMockup;
  },
  off: function(event, handler){
    this.el.removeEventListener(event, handler);
    return jQueryMockup;
  }
};

Backbone.$ = function(el){
  jQueryMockup.el = el;
  return jQueryMockup;
}

function getLink(elem){
  if(elem.nodeName === "A") return elem;
  else if(!elem.parentNode) return null;
  else return getLink(elem.parentNode);
}

function getHref(elem, rootPath){
  if(!elem || !elem.href) return false;
  var href = elem.getAttribute("href");
  if( href.indexOf( "/" ) === 0 ){
    if( href.indexOf(rootPath) === 0 ) return href.replace(/^\//, "");
    else return false;
  }
  else if( href.indexOf( "javascript:" ) === -1 ) return rootPath + "/" + href;
  return false;
}

var BaseRouter = Backbone.Router.extend({
  
  initialize: function(routes){
    this.routes = routes;
    var config  = require("config");
    var router  = this;
    var rootPath = document.getElementsByTagName("base")[0].href.replace(window.location.origin, ""); //config.router.base_path || "";
    this.rootPath = rootPath.replace(/^\/+/, "");
    document.body.addEventListener("click", function(e){
      var href = getHref(getLink(e.target), rootPath);
      if(href) {
        e.preventDefault();
        router.navigate(href, true);
      }
    });
  },

  startHistory: function(){
    Backbone.history.start({pushState: true});
  },

  back: function(n){
    Backbone.history.back(n || -1);
  },

  bindRoutes: function(){
    var rootPath = this.rootPath;
    for(var routePath in this.routes){
      var routeName = this.routes[routePath];
      if(Array.isArray(routeName)){
        for(var i=0;i<routeName.length;i++){
          this.route((rootPath+"/"+routePath).replace(/^\/+/,"").replace(/\/+$/,"").replace(/\/+/,"/"), routeName[i]);
        }
      }
      else{
        this.route((rootPath+"/"+routePath).replace(/^\/+/,"").replace(/\/+$/,"").replace(/\/+/,"/"), routeName);
      }
    }
  }

});

BaseRouter.__className = "Router";
BaseRouter.extend      = Class.extend;
module.exports         = BaseRouter;



