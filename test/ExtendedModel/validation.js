var assert = require("assert");
var ExtendedModel = require("../../lib/ExtendedModel.js");

var TestModel = ExtendedModel.extend("TestModel", {
  validation: {
    a: function(val){ return val > 5   && val < 10;   },
    b: function(val){ return val > 50  && val < 100;  },
    c: function(val){ return val > 500 && val < 1000; }
  }
});


var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe('Model -> validation' + currentFileMark, function(){
  
  it('Empty constructor should give missing error', function (next) {
    var m = new TestModel();
    assert.deepEqual(m.error, {a: "missing", b: "missing", c: "missing" });
    next();
  });

  it('Should be invalid model', function (next) {
    var m = new TestModel({ a:0, b:0, c: 0 });
    assert.deepEqual(m.error, {a: "invalid", b: "invalid", c: "invalid" });
    next();
  });

  it('Should be partially invalid model', function (next) {
    var m = new TestModel({ a:6, b:60, c: 0 });
    assert.deepEqual(m.error, {c: "invalid" });
    next();
  });

  it('Should create redundant error for extra fields', function(next){
    var m = new TestModel({ aa:0, bb:0, cc: 0 });
    assert.deepEqual(m.error, {
      aa: "redundant", bb: "redundant", cc: "redundant",
      a:  "missing",   b:  "missing",   c:  "missing"
    });
    next();
  });

  it('Should create mixed error' , function(next){
    var m = new TestModel({ 
      aa: 0, bb: 0, cc: 0, // redundant fields
      a: 0,                // invalid field,
      c: 700               // valid field
    });
    assert.deepEqual(m.error, {
      aa: "redundant", bb: "redundant", cc: "redundant",
      a:  "invalid",   b:  "missing"
    });
    next();
  });

});
