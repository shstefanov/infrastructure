var Backbone = require("backbone");
var colors = require("colors");
var _ = require("underscore");

var app;
var testHandler = function(name, opts, ctx){
  if(typeof opts == "undefined" && typeof callback == "undefined" && typeof name == "undefined"){
    return {
      app:function(_app){
        app = _app;
        app.tests = [];
        if(app.options.test_mode == "development"){
          app.infrastructure_tests = [];
        }
      }
    }
  }
  if(typeof ctx == "undefined"){
    var context = opts;
    var options = {}
  }
  else{
    var context = ctx;
    var options = opts;
  }
  
  
  if(app.options.test_mode != "development" && options.infrastructure == true){
    return;
  }
  
  var merged_options = {};
  for(key in app.options.test_options){ merged_options[key] = app.options.test_options[key]; }
  for(key in options){ merged_options[key] = options[key]; }
  
  if (app.options.test_mode == "development" && options.infrastructure == true){
    app.infrastructure_tests.push({name:name, options:merged_options,context:context});
  }
  else if(!options.infrastructure){
    app.tests.push({name:name, options:merged_options,context:context});
  }
  else{
    return;
  }
}



module.exports= function(app){

  app.test = testHandler;
  app.test().app(app);
  app.test("Wagon tests", {infrastructure:true, timeout:2000}, {Wagon:require("./utils/wagon.coffee")});

  app.Backbone   = Backbone;
  app.View       =                              require("./Backbone/view.coffee"  );
  app.Model      = Backbone.Model.extend       (require("./Backbone/model.coffee"));
  app.Collection = Backbone.Collection.extend  (require("./Backbone/collection.coffee"));
  
  app.Router     =                              require("./Backbone/router.coffee");
  app.Router.prototype.app = app


};
