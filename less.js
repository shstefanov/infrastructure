var fs = require("fs");
var path = require("path");

//Serves all .less files from /styles folder
module.exports = function(app, config){
  app.get("*.less", function(req, res) {
    var dest = path.normalize(config.stylesFolder + req.url);
    res.send(fs.readFileSync(dest).toString());
  });
};
