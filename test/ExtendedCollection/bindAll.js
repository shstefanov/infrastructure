var assert             = require("assert");
var BaseCollection     = require("../../lib/Collection.js");
var ExtendedModel      = require("../../lib/ExtendedModel.js");
var ExtendedCollection = require("../../lib/ExtendedCollection.js");

var TestModel          = ExtendedModel.extend("TestModel", { id_attribute: "id" });
var TestCollection     = ExtendedCollection.extend("TestCollection", { model: TestModel });

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe('ExtendedCollection -> bindAll' + currentFileMark, function(){

  it("Using bindAll to listen for model events", function(next){
    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ], { group: {field: "field"}} );

    var result, context;
    collection.bindAll("custom_event", function(data){
      result  = data;
      context = this;
    });

    collection.get(1).trigger("custom_event", "text 1");
    assert.equal( result, "text 1" );
    assert.equal( context === collection.get(1), true );

    collection.get(2).trigger("custom_event", "text 2");
    assert.equal( result, "text 2" );
    assert.equal( context === collection.get(2), true );

    var removed = collection.get(3);
    collection.remove(3);

    removed.trigger("custom_event", "text 3");
    assert.equal( result, "text 2" );
    assert.equal( context === collection.get(2), true );

    var added = collection.add({id: 6, field: "x"});
    added.trigger("custom_event", "text 6");
    assert.equal( result, "text 6" );
    assert.equal( context === collection.get(6), true );

    next();
  });

  it("Using unbindAll to stop listening", function(next){
    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ], { group: {field: "field"}} );

    var result, context;
    collection.bindAll("custom_event", function(data){
      result  = data;
      context = this;
    });

    collection.get(1).trigger("custom_event", "text 1");
    assert.equal( result, "text 1" );
    assert.equal( context === collection.get(1), true );

    collection.unbindAll("custom_event");

    collection.get(2).trigger("custom_event", "text 2");
    assert.equal( result, "text 1" );
    assert.equal( context === collection.get(1), true );

    var removed = collection.get(3);
    collection.remove(3);

    removed.trigger("custom_event", "text 3");
    assert.equal( result, "text 1" );
    assert.equal( context === collection.get(1), true );

    var added = collection.add({id: 6, field: "x"});
    added.trigger("custom_event", "text 6");
    assert.equal( result, "text 1" );
    assert.equal( context === collection.get(1), true );

    next();
  });

});
