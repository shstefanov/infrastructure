var assert = require("assert");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe('Class' + currentFileMark, function(){

  var Class = require("../../lib/Class.js");

  it("The name of the class", function(){
    var Child = Class.extend("ChildClassName", {}, {});
    assert.equal(Child.__className, "Class_ChildClassName");
  });

  it("Should allow only word characters in class name", function(){
    var Child = Class.extend("TestClassName", {}, {});
    assert.equal(Child.__className, "Class_TestClassName");

    var Child = Class.extend("Test__ClassName", {}, {});
    assert.equal(Child.__className, "Class_Test__ClassName");

    var Child = Class.extend("test_name", {}, {});
    assert.equal(Child.__className, "Class_test_name");
  });

});