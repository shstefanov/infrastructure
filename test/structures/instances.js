var path           = require("path");
var assert         = require("assert");
var infrastructure = require("../../index.js" );

var rootDir      = path.join(__dirname, "fixtures/instances");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");

[ "single", "cluster" ].forEach(function(process_mode){

  describe("Loading instances structures in " + process_mode + " process_mode"+ currentFileMark, function(){
    var env;
    
    it("Starts application", function(next){
      infrastructure({
        process_mode:   process_mode,
        rootDir:        rootDir
      }, function(err, _env){
        assert.equal(err, null);
        env = _env;
        next()
      })
    });

    it("Call existing targets", function(next){
      env.i.do("instances_components.el1.method_1", 4, function(err, result){
        assert.equal(err, null);
        assert.equal(result, 20);
        next();
      })
    });

    it("Call existing targets", function(next){
      env.i.do("instances_components.el1.method_2", 4, function(err, result){
        assert.equal(err, null);
        assert.equal(result, 24);
        next();
      })
    });

    it("Call existing targets", function(next){
      env.i.do("instances_components.el2.method_1", 15, function(err, result){
        assert.equal(err, null);
        assert.equal(result, 25);
        next();
      })
    });

    it("Call existing targets", function(next){
      env.i.do("instances_components.el2.method_2", 100, function(err, result){
        assert.equal(err, null);
        assert.equal(result, 120);
        next();
      })
    });


    it("Stops application", function(next){
      env.stop(function(err){
        assert.equal(err, null);
        next();
      });

    });

  });



  
})

