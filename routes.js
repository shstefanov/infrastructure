var _ = require("underscore");

var methods = {
  get:"get",
  post:"post",
  put:"put",
  del:"del"
};

module.exports = function(server, pages, config){ //all bundles

  pages.forEach(function(page){
    server[methods[page.method]](page.route, function(req, res, next){
      var pageConfig = JSON.stringify(_.extend(config.clientConfig, page.config || {}));
      console.log("pageConfig",config);

      function go (customData) {
        res.render("layout.jade", {
          scripts: page.staticScripts,
          styleSheets: page.styleSheets || config.defaultStyleSheets, 
          title: typeof page.title == "function"? page.title(req, res) : page.title,
          config:pageConfig,
          custom: JSON.stringify(customData || {}),
        });
      };

      if(page.callback && typeof page.callback == "function") page.callback(req, res, next, go);
      else go({});

    });
  });
};


