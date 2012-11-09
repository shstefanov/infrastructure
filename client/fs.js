var RM = require("./ResourceManager");

var fs = new RM();
__filelist.forEach(function(file){
  var path = file.replace("./", "").replace(".js", "");
  if(path == "fs.js") return;
  fs.set(path, include(file), "/");
});

module.exports = fs.store;
