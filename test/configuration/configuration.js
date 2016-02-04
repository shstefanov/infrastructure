var path   = require("path");
var assert = require("assert");
var _      = require("underscore");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe( "Application configuration" + currentFileMark, function(){
  
  var infrastructure = require("../../index.js");
  // Stopping defaut initializer and jumping into callback
  var original_init = infrastructure.init;

  describe("Check presense of config", function(){

    it("loader - hasConfig on folder without config", function(next){
      // Mockup init - will be restored at the end of this test
      infrastructure.init = function(env, cb){ cb(null, env); };

      var target = path.join(__dirname, "fixtures/no_config");
      assert.equal( infrastructure.hasConfig(target), false );
      next();
    });

    it("loader - hasConfig on folder with config.json", function(next){
      var target = path.join(__dirname, "fixtures/config_json");
      assert.equal( infrastructure.hasConfig(target), true );
      next();
    });

    it("loader - hasConfig on folder with config.js", function(next){
      var target = path.join(__dirname, "fixtures/config_js");
      assert.equal( infrastructure.hasConfig(target), true );
      next();
    });

    it("loader - hasConfig on folder with config.yml", function(next){
      var target = path.join(__dirname, "fixtures/config_yml");
      assert.equal( infrastructure.hasConfig(target), true );
      next();
    });

    it("loader - hasConfig on folder with config folder", function(next){
      var target = path.join(__dirname, "fixtures/config_folder");
      assert.equal( infrastructure.hasConfig(target), true );
      next();
    });

  });

  describe("Loads config by given file or folder path", function(){

    it("Loads config.js", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_js/config.js"), {mode: "test"});
      assert.deepEqual(config, { foo: 55, bar: 66, mode: "test" });
      next();
    });

    it("Loads config.json", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_json/config.json"), {mode: "test"});
      assert.deepEqual(config, { foo: 12, bar: 13, mode: "test" });
      next();
    });

    it("Loads config.yml", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_yml/config.yml"), {mode: "development"});
      assert.deepEqual(config, { foo: 30, bar: 40, mode: "development"});
      next();
    });

    it("Loads config folder with mixed files and folders", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_folder/config"), {mode: "custom"});
      assert.deepEqual(config, {
        mode: "custom",
               foo: {a: 5 }, bar: {b: 6 }, baz: {c: 7 } ,
        sub: { foo: {a: 25}, bar: {b: 26}, baz: {c: 27}, faz: { json_for_humans: 22 } }
      });
      next();
    });

  });

  describe("Extending config depending on mode", function(){

    it("If no mode is specified - no config patches", function(next){

      infrastructure.init = original_init;

      infrastructure({
        rootDir:   path.join(__dirname, "fixtures/test_production_config")
      }, function(err, env){
        assert.equal( err, null );

        // Omit options - it contains cli arguments
        assert.deepEqual( _.omit(env.config, ["options"]), {

          process_mode:            "single",
          rootDir:                 path.join(__dirname, "fixtures/test_production_config"),
          app: {
            original_property:     "original",
            app_property:          "value"
          },

          development: {
            custom_development_config: "random",
            app: {
              app_property:        "new_value",
              additional_property: "additional_value"
            }
          },

          test: {
            custom_test_development_config: "test_random",
            app: {
              app_property:                 "test_value",
              additional_test_property:     "additional_test_value"
            }
          }


        });
        next();
      });
    });

    it("If mode is specified - override config and remove branch from root", function(next){
      infrastructure({
        mode: "development",
        rootDir: path.join(__dirname, "fixtures/test_development_config")
      }, function(err, env){

        // Omit options - it contains cli arguments
        assert.deepEqual( _.omit(env.config, ["options"]), {

          mode:                      "development",
          process_mode:              "single",
          rootDir:                   path.join(__dirname, "fixtures/test_development_config"),
          app: {
            original_property:       "original",
            app_property:            "new_value",
            additional_property:     "additional_value"
          },
          custom_development_config: "random",

          test: {
            custom_test_development_config: "test_random",
            app: {
              app_property:                 "test_value",
              additional_test_property:     "additional_test_value"
            }
          }


        });
        next();
      });
    });

  });

});
