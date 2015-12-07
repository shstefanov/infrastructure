var helpers = require("../../lib/helpers.js");
var assert  = require("assert");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe("helpers -> resolve" + currentFileMark, function(){
  
  it("Simple resolve", function(next){
    var target = {child: 5};
    var result = helpers.resolve(target, "child")
    assert.equal(result, 5);
    next();
  });

  it("Deep resolve", function(next){
    var target = {child: {sub_child: 6}};
    var result = helpers.resolve(target, "child.sub_child");
    assert.equal(result, 6);
    next();
  });

  it("Resolve nonexisting path evaluates to undefined", function(next){
    var target = {child: {sub_child: 6}};
    var result = helpers.resolve(target, "child.sub_child.sub_sub_child_prop");
    assert.equal(result, undefined);
    next();
  });

  it("Resolve simple prototype property", function(next){
    var Target = function(){};
    Target.prototype.child = 7;
    var target = new Target();
    var result = helpers.resolve(target, "child");
    assert.equal(result, 7);
    next();
  });

  it("Resolve deep prototype property", function(next){
    var Target = function(){};
    Target.prototype.child = {aa: 55};
    var target = new Target();
    var result = helpers.resolve(target, "child.aa");
    assert.equal(result, 55);
    next();
  });

  it("Resolve deeply nested instances", function(next){
    var SubChild = function(value){ this.value = value; };
    var Child    = function(){};
    Child.prototype.sub_child = new SubChild(77);
    var Target   = function(){};
    Target.prototype.child = new Child();
    var target = new Target();
    var result = helpers.resolve(target, "child.sub_child.value");
    assert.equal(result, 77);
    next();
  });

});
