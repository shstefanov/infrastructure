var assert             = require("assert");
var BaseCollection     = require("../../lib/Collection.js");
var ExtendedModel      = require("../../lib/ExtendedModel.js");
var ExtendedCollection = require("../../lib/ExtendedCollection.js");

var TestModel          = ExtendedModel.extend("TestModel", { id_attribute: "id" });
var TestCollection     = ExtendedCollection.extend("TestCollection", { model: TestModel });

describe('ExtendedCollection -> indexBy', function(){

  it("Sets collection group by constructor options", function(next){
    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ], { group: {field: "field"}} );
    collection.add();

    assert.equal(collection.getGroup("field", "a") instanceof BaseCollection, true );
    assert.equal(collection.getGroup("field", "b") instanceof BaseCollection, true );
    assert.equal(collection.getGroup("field", "a").length, 2);
    assert.equal(collection.getGroup("field", "b").length, 3);

    next();
  });

  it("Sets collection group by prototype property", function(next){
    var GroupedCollection = TestCollection.extend("GroupedCollection", { group: {field: "field"} } );
    var collection = new GroupedCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ]);

    assert.equal(collection.getGroup("field", "a") instanceof BaseCollection, true );
    assert.equal(collection.getGroup("field", "b") instanceof BaseCollection, true );
    assert.equal(collection.getGroup("field", "a").length, 2);
    assert.equal(collection.getGroup("field", "b").length, 3);

    next();
  });

  it("Updates groups on model change", function(next){
    var GroupedCollection = TestCollection.extend("GroupedCollection", { group: {field: "field"} } );
    var collection = new GroupedCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ]);

    collection.get(1).set({field: "b"});

    assert.equal(collection.getGroup("field", "a").length, 1);
    assert.equal(collection.getGroup("field", "b").length, 4);
    next();
  });

  it("Create group on model change", function(next){
    var GroupedCollection = TestCollection.extend("GroupedCollection", { group: {field: "field"} } );
    var collection = new GroupedCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ]);

    collection.get(1).set({field: "c"});

    assert.equal(collection.getGroup("field", "a").length, 1);
    assert.equal(collection.getGroup("field", "c").length, 1);
    assert.equal(collection.getGroup("field", "b").length, 3);
    next();
  });

  it("Drop group when no models from index", function(next){
    var GroupedCollection = TestCollection.extend("GroupedCollection", { group: {field: "field"} } );
    var collection = new GroupedCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ]);

    collection.get(1).set({field: "c"});
    collection.get(2).set({field: "c"});

    assert.equal(collection.getGroup("field", "a"), undefined );
    next();
  });

});
