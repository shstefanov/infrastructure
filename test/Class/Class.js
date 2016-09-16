var assert = require("assert");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe('Class' + currentFileMark, function(){

  var Class = require("../../lib/Class.js");

  it("The name of the class", function(){
    var Child = Class.extend("ChildClassName", {}, {});
    console.log("Child: ", Child.__className);
    assert.equal(Child.__className, "Class_ChildClassName");

  })

  // console.log(Class);


});