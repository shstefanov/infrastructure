var path   = require("path");
var assert = require("assert");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe( "Application loader" + currentFileMark, function(){
  
  var infrastructure = require("../../index.js");
  // Stopping defaut initializer and jumping into callback
  infrastructure.init = function(env, cb){ cb(null, env); };

  describe("Check presense of config", function(){

    it("loader - hasConfig on folder without config", function(next){
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
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_js/config.js"));
      assert.deepEqual(config, { foo: 55, bar: 66 });
      next();
    });

    it("Loads config.json", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_json/config.json"));
      assert.deepEqual(config, { foo: 12, bar: 13 });
      next();
    });

    it("Loads config.yml", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_yml/config.yml"));
      assert.deepEqual(config, { foo: 30, bar: 40 });
      next();
    });

    it("Loads config folder with mixed files and folders", function(next){
      var config = infrastructure.loadConfig(path.join(__dirname, "fixtures/config_folder/config"));
      assert.deepEqual(config, { 
               foo: {a: 5 }, bar: {b: 6 }, baz: {c: 7 } ,
        sub: { foo: {a: 25}, bar: {b: 26}, baz: {c: 27} }
      });
      next();
    });

  });

  xdescribe("Extending config depending on mode", function(){

    it("If no mode is set, setting default to 'development'", function(next){
      infrastructure({
        rootDir: path.join(__dirname, "test_config")
      }, function(err, env){
        assert.equal(env.config.mode, "development");
        next();
      });
    });

    it("If mode is production - no config overridings", function(next){
      infrastructure({
        mode:      "production",
        rootDir:   path.join(__dirname, "fixtures/test_production_config")
      }, function(err, env){
        assert.equal( env.config.development, undefined );
        assert.equal( env.config.test,        undefined );
        assert.deepEqual( env.config, {

          mode:                    "production",
          process_mode:            "single",
          rootDir:                 path.join(__dirname, "fixtures/test_production_config"),
          app: {
            original_property:     "original",
            app_property:          "value"
          }

        });
        next();
      });
    });

    it("If mode is development - override config with development settings", function(next){
      infrastructure({
        mode: "development",
        rootDir: path.join(__dirname, "fixtures/test_development_config")
      }, function(err, env){
        assert.equal( env.config.development, undefined );
        assert.equal( env.config.test,        undefined );
        assert.deepEqual( env.config, {

          mode:                      "development",
          process_mode:              "single",
          rootDir:                   path.join(__dirname, "fixtures/test_development_config"),
          app: {
            original_property:       "original",
            app_property:            "new_value",
            additional_property:     "additional_value"
          },
          custom_development_config: "random"

        });
        next();
      });
    });

    it("If mode is test - override config with test settings", function(next){
      infrastructure({
        mode: "test",
        rootDir: path.join(__dirname, "fixtures/test_test_config")
      }, function(err, env){
        assert.equal( env.config.development, undefined );
        assert.equal( env.config.test,        undefined );
        assert.deepEqual( env.config, {

          mode:                      "test",
          process_mode:              "single",
          rootDir:                   path.join(__dirname, "fixtures/test_test_config"),
          app: {
            original_property:       "original",
            app_property:            "test_value",
            additional_test_property:     "additional_test_value"
          },
          custom_test_development_config: "test_random"

        });
        next();
      });
    });

  });

});
