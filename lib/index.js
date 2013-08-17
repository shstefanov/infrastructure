var Backbone = require("backbone");

module.exports= function(app){

  app.View       =                              require("./Backbone/view.coffee"  );
  app.Model      = Backbone.Model.extend       (require("./Backbone/model.coffee"));
  app.Collection = Backbone.Collection.extend  (require("./Backbone/collection.coffee"));
  
  app.Router     =                              require("./Backbone/router.coffee");
  app.Router.prototype.app = app


};
