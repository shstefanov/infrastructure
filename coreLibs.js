var fs = require("fs");
var path = require("path");


module.exports = function(app, config){
  app.get("/core-libs/:filename", function(req, res) {
    var fileName = req.params.filename;
    var fileExt = filename.split(".").pop();
    var dest = path.normalize(config.stylesFolder + req.url);
    res.send(fs.readFileSync(dest).toString());
  });
};
