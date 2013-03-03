var _ = require("underscore");
var helpers = require("./helpers");

//Allowed http request methods
var methods = {
  get:"get",
  post:"post",
  put:"put",
  del:"del"
};

module.exports = function(app, config){

  //Loading all defined in pages folder page definitons
  var pages = helpers.loadDirAsArray(config.routesFolder);
  
  //Setting up server to serve each of them
  pages.forEach(function(page){
   
    app[methods[page.method]](page.route, function(req, res, next){

      function go (new_page) {
        
        //Packing pageconfig to be sent to client
        var pageConfig = _.extend(config.clientConfig, new_page.config || {});
        
        req.session.services = new_page.services;

        //Setting up javascript libs
        var libs = config.defaultStaticScripts? 
          config.defaultStaticScripts.slice() : [];//.slice() makes new copy
        if(new_page.libs)
          new_page.libs.forEach(function(lib){
            libs.push(lib);
          });

        //Setting up stylesheets
        var styles = config.defaultStyleSheets? 
          config.defaultStyleSheets.slice() : []; //.slice() makes new copy
        if(new_page.styleSheets)
          new_page.styleSheets.forEach(function(style){
            styles.push(style);
          });
        
        //Rendering with template engine - jade
        res.render("init.jade", {
          bundles:new_page.bundles, //Array of javascript bundles mountpoints
          libs:libs, 
          styleSheets: styles,
          title: new_page.title, 
          config:JSON.stringify(pageConfig),  //Page config
          services: JSON.stringify(_.union(new_page.services || [], config.defaultPageServices )),
          bodyAdd:page.bodyAdd || "" //Some javascripts need to have initialization in the body of the document
        });
      };

      //If there is callback in page definition, waiting it to call go() function
      if(page.callback && typeof page.callback == "function"){
        page.req = req;
        page.res = res;
        page.next = next;

        page.callback(page, app, go);
      }

      //Else - run the page rendering
      else go(page);

    });
  });
};


