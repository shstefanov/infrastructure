var Suite = require("./test/suite.js")
, async = require('async')
, _ = require("underscore")
, Backbone = require("backbone")
, colors = require("colors")
, _ = require("underscore");

var app;

var core_tests = [];
var app_tests = [];

postProcessSuite = function(callback){
  return function(err, logs){ 
    if(err){callback(err);}
    else{
      async.mapSeries(logs, function(t_logs, cb){
        t_logs.log.forEach(function(l){
          if(app.test_logger) {app.test_logger(l);}
          else{console.log(l.console);}
          cb(null, l.sum)
        });
      },function(err, sums){
        var result = {};
        sums.forEach(function(s){
          for(key, val in s){
            if(!result[key]){result[key] = val;}
            else{result[key]+=val; }
          }
        });
        callback(err, app);
      });
    }
  }
};

var processSuite = function(suite, spec, unit, cb){
  if(typeof spec == "function"){
    spec(suite, unit.context);
    suite.run(function(summary, log){
      cb(null, {log:log, sum:summary});
    });
  }
  else if(typeof tspec == "object"){
    suite.expand(spec).run(function(summary, log){
      cb(null, {log:log, sum:summary});
    });
  }
};

var serializeSpecs = function(path, callback){
    var specs = require(path);
    async.mapSeries(core_tests, function(unit, cb){
    if(typeof specs[unit.name]){ //Spect with this name exists
      processSuite(new Suite(unit.name, 0, unit.context, unit.options), specs[unit.name], unit, cb);
    } 
  }, postProcessSuite(callback));
};

var test_runners = {
  core: function(app, callback){
    serializeSpecs(app.options.tests_location, callback);
  },
  application: function(app, callback){
    serializeSpecs(config.tests_location, callback);
  }
};

var addCoreTest = function(name, level, context, options){
  options = _.extend(app.options.test_options);
  core_tests.push({name:name, level:level, options:options,context:context});
};
var addAppTest = function(name, level, context, options){
  options = _.extend(app.options.test_options);
  app_tests.push({name:name, level:level, options:options,context:context});
};

var addTest = function(){
  if(app.options.test_mode == "framework"){
    app.testCore = test_runners.core;
    return {core:addCoreTest, app:function(){}};
  }
  else if(app.options.test_mode == "application"){
    app.testApp = test_runners.application;
    return {app:addAppTest, core:function(){}};
  }
};


module.exports= function(_app){
  app = _app;

  app.addTest = addTest;

  app.addTest().core("Wagon tests", 0, {Wagon:require("./utils/wagon.coffee")}, {});

  app.Backbone   = Backbone;
  app.View       =                              require("./Backbone/view.coffee"  );
  app.Model      = Backbone.Model.extend       (require("./Backbone/model.coffee"));
  app.Collection = Backbone.Collection.extend  (require("./Backbone/collection.coffee"));
  
  app.Router     =                              require("./Backbone/router.coffee");
  app.Router.prototype.app = app


};
