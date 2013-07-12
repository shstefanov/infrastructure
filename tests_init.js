var Suite = require("./lib/suite.js")
, async = require('async');

module.exports = {
  core: function(app, callback){
    var tests = require(app.options.tests_location);
    async.mapSeries(app.infrastructure_tests, function(test, cb){
      //{name:name, options:options,context:context}
      if(tests[test.name]){
        var suite = new Suite(test.name, test.options);
        tests[test.name](suite, test.context);
        suite.run(cb);
      }
    }, function(err){
      if(err){callback(err);}
      else{
        async.mapSeries(app.tests, function(test, cb){
          test.log.forEach(function(l){
            console.log(l);
            console.log();
            console.log();
          });
        },function(err){
          callback(err, app);
        });
      }
    });
  },
  application: function(app, callback){
    var tests = require(config.tests_location);
    async.mapSeries(app.tests, function(test, cb){
      //{name:name, options:options,context:context}
      if(tests[test.name]){
        var suite = new Suite(test.name, test.options);
        tests[test.name](suite, test.context);
        suite.run(cb);
      }
    }, function(err){
      if(err){callback(err);}
      else{
        async.mapSeries(app.tests, function(test, cb){
          test.log.forEach(function(l){
            console.log(l);
            console.log();
            console.log();
          });
        },function(err){
          callback(err, app);
        });
      }
    });
  }
}
