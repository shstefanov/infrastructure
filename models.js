var helpers = require("./helpers");
var _ = require("underscore");

//Called in index.js
module.exports = function(app, config){
  
  app.db.load(config.models, function (err) {
    if(err) throw err;
    app.db.sync(function(err){
      if(err) throw err;
    });
    app.models = app.db.models;
  });

};

