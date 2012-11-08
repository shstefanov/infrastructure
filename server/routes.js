var _ = require("underscore");

var clientConfig = require("../config/clientConfig.js");
var config = require("../config");


var methods = {
  get:"get",
  post:"post",
  put:"put",
  del:"del"
};

module.exports = function(server, pages, bundles){ //all bundles

  pages.forEach(function(page){
    server[methods[page.method]](page.route, function(req, res, next){

      function go (customData) {
        res.render(page.template, {
          scripts: page.staticScripts,
          styleSheets: page.styleSheets || config.defaultStyleSheets, 
          title: typeof page.title == "function"? page.title(req, res) : page.title,
          config:JSON.stringify(_.extend(clientConfig, page.config || {})),
          custom: JSON.stringify(customData || {}),
        });
      };

      if(page.callback && typeof page.callback == "function") page.callback(req, res, next, go);
      else go({});

    });
  });
};


