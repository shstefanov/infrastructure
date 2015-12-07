var path           = require("path");
var assert         = require("assert");
var infrastructure = require("../../index.js" );

var process_mode = "single"

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");

describe("Test process mode: "+process_mode + currentFileMark, function(){
  var env;
  it("Starts application in mode: "+ process_mode, function(next){
    infrastructure({
      process_mode:   process_mode,
      rootDir:        path.join(__dirname, "fixtures/test_app"),
      structures: {
        log: {engines: ["log"], options: {sys: false}}
      }
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
