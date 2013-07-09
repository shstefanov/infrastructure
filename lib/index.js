var Backbone = require("backbone");

module.exports= function(app){
  app.Backbone   = Backbone;
  app.Router     = Backbone.Router.extend      (require("./Backbone/router.coffee"));
  app.View       = Backbone.View.extend        (require("./Backbone/view.coffee"));
  app.Model      = Backbone.Model.extend       (require("./Backbone/model.coffee"));
  app.Collection = Backbone.Collection.extend  (require("./Backbone/collection.coffee"));
};