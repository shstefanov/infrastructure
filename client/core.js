var files = require("./files");
console.log(files);

window.App = function(){

  _.extend(this, files.app);

  this.models = {};
  _.extend(this.models, files.models.build());
  this.collections = {}
  _.extend(this.collections, files.collections.build());
};
