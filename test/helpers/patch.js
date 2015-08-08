var helpers = require("../../lib/helpers.js");
var assert  = require("assert");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe("helpers -> patch" + currentFileMark, function(){
  
  it("Simple patch", function(next){
    var target = {};
    helpers.patch( target, "child", "Some value" );
    assert.deepEqual(target, { "child": "Some value" });
    next();
  });

  it("Deep patch", function(next){
    var target = {};
    helpers.patch( target, "child.sub_child", "Some value" );
    assert.deepEqual(target, { "child": {"sub_child": "Some value"} });
    next();
  });

  it("Patch with existing child", function(next){
    var target = {};
    var child  = {};
    target.child = child;
    helpers.patch( target, "child.sub_child", "Some value" );
    assert.deepEqual(target, { "child": {"sub_child": "Some value"} });
    assert.equal( target.child, child ); // Is the same object
    next();
  });

  it("Patch with key-values object", function(next){
    var target = {};
    var child  = {};
    target.child = child;
    helpers.patch( target, {
      "child.sub_child":  "Some value",
      "child.sub_child2": "Other value",
    });
    assert.deepEqual( target, { "child": { "sub_child": "Some value", "sub_child2": "Other value" } });
    assert.equal( target.child, child ); // Is the same object
    next();
  });

  it("Patch with overriding property", function(next){
    var target = {};
    var child1 = {};
    var child2 = {};
    target.child = child1;
    helpers.patch( target, {
      "child":            child2,
      "child.sub_child":  "Some value",
      "child.sub_child2": "Other value",
    });
    assert.deepEqual( target, { "child": { "sub_child": "Some value", "sub_child2": "Other value" } });
    assert.notEqual ( target.child, child1  ); // Is not the same object
    assert.equal    ( target.child, child2 ); // Is the same object
    next();
  });

  it("Patches prototype property", function(next){

    var child = {};

    var Target = function(){};
    Target.prototype.child = child

    var target = new Target();
    helpers.patch( target, {
      "child.sub_child":  "Some value",
      "child.sub_child2": "Other value",
    });
    assert.deepEqual( target.child,   { "sub_child": "Some value", "sub_child2": "Other value" } );
    assert.equal    ( target.child, child ); // Is the same object
    next();
  });

  it("Patch overrides prototype property", function(next){

    var child1 = {};
    var child2 = {};

    var Target = function(){};
    Target.prototype.child = child1

    var target  = new Target();
    var target2 = new Target();
    helpers.patch( target, {
      "child":            child2, // This overrides child
      "child.sub_child":  "Some value",
      "child.sub_child2": "Other value",
    });
    assert.deepEqual( target.child,   { "sub_child": "Some value", "sub_child2": "Other value" }  );
    assert.notEqual ( target.child, child1 ); // Is not the same object
    assert.equal    ( target.child, child2 ); // Is not the same object
    assert.equal    ( target.__proto__.child, child2 ); // Is the same object
    assert.equal    ( target2.__proto__.child, child2 ); // __proto__ changed
    next();
  });

  it("Patching deeply nested instances", function(next){
    var SubChild  = function(value){ this.value = value; };
    var Child     = function(){};
    var sub_child = new SubChild(99);
    Child.prototype.sub_child = sub_child;
    var Target    = function(){};
    var child     = new Child();
    Target.prototype.child = child;
    var target    = new Target();
    var result    = helpers.patch( target, "child.sub_child.value", 12 );
    assert.equal ( target.__proto__.child, child);
    assert.equal ( target.child, child);
    assert.equal ( target.__proto__.child.__proto__.sub_child, sub_child);
    assert.equal ( target.child.sub_child, sub_child);
    assert.equal ( target.child.sub_child.value, 12 );
    next();
  });




});
