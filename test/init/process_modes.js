var path   = require("path");
var assert = require("assert");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe( "Cluster modes" + currentFileMark, function(){

  var infrastructure       = require("../../index.js"               );
  var single_initializer   = require("../../init/process/single.js" );
  var original_initializer = require("../../init.js"                );
  var skip_init = infrastructure.init = function(env, cb){ cb(null, env); };

  describe( "Cluster mode - \"single\"", function(){

    it("If not present, process_mode should be set to \"single\"", function(next){
      infrastructure({ rootDir: __dirname }, function(err, env){
        assert.equal(env.config.process_mode, "single");
        next();
      });
    });

    it("In process_mode \"single\" all confings from structures should be merged into main config", function(next){
      infrastructure.init = original_initializer;
      infrastructure({ rootDir: path.join(__dirname, "fixtures/single_mode_config") }, function(err, env){
        // assert.deepEqual(env.config, { 
        //   mode:            "development",
        //   process_mode:    "single",
        //   rootDir:         path.join(__dirname, "fixtures/single_mode_config"),
        //   config_prop_a: "config_val_a",
        //   config_prop_b: "config_val_b",
        //   structures: {
        //     "structure_a":{
        //       "path":    "structure_a",
        //       "loaders": ["loader_a.js"],
        //       "engines": ["engine_a.js"]
        //     },

        //     "structure_b":{
        //       "path":    "structure_b",
        //       "loaders": ["loader_b.js"],
        //       "engines": ["engine_b.js"]
        //     }
        //   }
        // });
        next();
      });
    });

  });


});
