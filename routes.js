var _ = require("underscore");
var helpers = require("./helpers");

var methods = {
  get:"get",
  post:"post",
  put:"put",
  del:"del"
};

module.exports = function(server, config){ //all bundles

  var pages = helpers.loadDirAsArray(config.routesFolder);


  pages.forEach(function(page){

    server[methods[page.method]](page.route, function(req, res, next){
      var pageConfig = JSON.stringify(_.extend(config.clientConfig, page.config || {}));


      console.log("pages:", page.bundles);

      function go (customData) {
        res.render("init.jade", {
          bundles:page.bundles,
          libs:page.libs,
          styleSheets: page.styleSheets, 
          title: typeof page.title == "function"? page.title(req, res) : page.title,
          config:pageConfig,
          custom: JSON.stringify(customData || {}),
          bodyAdd:page.bodyAdd || ""
        });
      };

      if(page.callback && typeof page.callback == "function") page.callback(req, res, next, go);
      else go({});

    });
  });
};


