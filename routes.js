var _ = require("underscore");
var helpers = require("./helpers");

//Allowed http request methods
var methods = {
  get:"get",
  post:"post",
  put:"put",
  del:"del"
};

module.exports = function(server, config){

  //Loading all defined in pages folder page definitons
  var pages = helpers.loadDirAsArray(config.routesFolder);
  
  //Setting up server to serve each of them
  pages.forEach(function(page){

    server[methods[page.method]](page.route, function(req, res, next){

      //Packing pageconfig to be sent to client
      var pageConfig = _.extend(config.clientConfig, page.config || {});
      pageConfig.services = page.services;
      req.services = page.services;

      //Title of the page - can be function (sync)
      var title = typeof page.title == "function"? page.title(req, res) : page.title;

      //Rendering is separate function, page can have callback
      function go (customData) {
        //Rendering with template engine - jade
        res.render("init.jade", {
          bundles:page.bundles, //Array of javascript bundles mountpoints
          libs:page.libs,       //Array of external libs (in static folder)
          styleSheets: page.styleSheets, //Stylesheets to be loaded
          title: title, //Title of the page(can be function)
          config:JSON.stringify(pageConfig),  //Page config
          custom: JSON.stringify(customData || {}), //Custom data, provided by callback in go() function
          bodyAdd:page.bodyAdd || "" //Some javascripts need to have initialization in the body of the document
        });
      };

      //If there is callback in page definition, waiting it to call go() function
      if(page.callback && typeof page.callback == "function") 
        page.callback(req, res, next, go);

      //Else - run the page rendering
      else go({});

    });
  });
};


