
files = new window.RM();
__filelist.forEach(function(file){
  var path = file.replace("./", "").replace(".js", "");
  if("."+__filename ==  file) return;
  if(path == "fs.js") return;
  files.set(path, include(file), "/");
});

module.exports = files.store;
