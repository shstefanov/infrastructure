var path   = require("path");
var assert = require("assert");
var _      = require("underscore");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe( "Callbacks and listeners" + currentFileMark, function(){

  var env;
  var test_env = require("../../test_env");
  it("Starts application", function(next){
    test_env.start({
      process_mode: "cluster",
      rootDir: path.join(__dirname, "app_fixture")
    }, function(err, _env){
      assert.equal(err, null);
      env = _env;
      next();
    });
  });

  it("Calls target with callback", function(next){
    var results = [], messages = [];
    var messageListener = function(message){
      messages.push(message);
      if(messages.length === 3){
        assert.equal(results.length, 1);
        next();
      }
    }
    env.i.do("structure_a.target_a.handle_callback", 123, function(err, data){
      assert.equal(err, null);
      assert.equal(data, 123);
      results.push([err, data]);
    });
    env.i.structure_a.on("message", messageListener);
  });

  it("Calls target and give listener", function(next){
    var results = [], messages = [];
    var messageListener = function(message){
      messages.push(message);
      if(messages.length === 3){
        assert.equal(results.length, 3);
        assert.deepEqual(results, [ [3, 123], [2, 123], [1, 123] ]);
        next();
      }
    }
    env.i.structure_a.on("message", messageListener);
    env.i.do("structure_a.target_a.handle_listener", 123, function do_listener(num, data){
      results.push([num, data]);
    });
  });



  it("Stops application", function(next){
    env.stop(function(err){
      assert.equal(err, null);
      next();
    });
  });

});