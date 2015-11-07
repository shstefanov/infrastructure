var path           = require("path");
var assert         = require("assert");
var infrastructure = require("../../index.js" );

var process_mode = "cluster";
var rootDir      = path.join(__dirname, "fixtures/test_app");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");


console.log("here ---------");

describe("Test process mode: "+process_mode + currentFileMark, function(){
  var env;
  it("Starts application in mode: "+ process_mode, function(next){
    infrastructure({
      process_mode:   process_mode,
      rootDir:        rootDir
    }, function(err, _env){
      assert.equal(err, null);
      env = _env;
      next()
    })
  });

  it("Stops application in mode: "+ process_mode, function(next){
    env.stop(function(err){
      assert.equal(err, null);
      next();
    });

  });

});
