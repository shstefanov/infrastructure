var path   = require("path");
var assert = require("assert");
var _      = require("underscore");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe( "Callback tmeout" + currentFileMark, function(){

  var env;
  var test_env = require("../../test_env");
  it("Starts application", function(next){
    test_env.start({
      callback_timeout: 500,
      callback_check_timeout_interval: 50,
      process_mode: "cluster",
      rootDir: path.join(__dirname, "timeout_fixture")
    }, function(err, _env){
      assert.equal(err, null);
      env = _env;
      next();
    });
  });

  it("Responds with 'Callback timeout error'", function(next){
    env.i.do("structure_a.target_a.echo_1000", 123, function(err, data){
      assert.equal(err, "Callback timeout error");
      next();
    });
  });

  it("Stops application", function(next){
    env.stop(function(err){
      assert.equal(err, null);
      next();
    });
  });

});