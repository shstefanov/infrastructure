var assert             = require("assert");
var ExtendedModel      = require("../../lib/ExtendedModel.js");
var ExtendedCollection = require("../../lib/ExtendedCollection.js");

var TestModel          = ExtendedModel.extend("TestModel", { id_attribute: "id" });
var TestCollection     = ExtendedCollection.extend("TestCollection", { model: TestModel });

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe('ExtendedCollection -> indexBy' + currentFileMark, function(){

  it("Sets collection index by constructor options", function(next){
    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ], {index: {field: "field"}});

    assert.equal(collection.getBy("field", "a"), collection.get(1));
    assert.equal(collection.getBy("field", "b"), collection.get(2));
    assert.equal(collection.getBy("field", "c"), collection.get(3));
    assert.equal(collection.getBy("field", "d"), collection.get(4));
    assert.equal(collection.getBy("field", "e"), collection.get(5));

    next();
  });

  it("Sets collection index by prototype property", function(next){
    var IndexedCollection = TestCollection.extend("IndexedCollection", {
      index: { field: "field" }
    });
    var collection = new IndexedCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ]);

    assert.equal(collection.getBy("field", "a"), collection.get(1));
    assert.equal(collection.getBy("field", "b"), collection.get(2));
    assert.equal(collection.getBy("field", "c"), collection.get(3));
    assert.equal(collection.getBy("field", "d"), collection.get(4));
    assert.equal(collection.getBy("field", "e"), collection.get(5));

    next();
  });

  it("Sets collection index by calling indexBy method", function(next){

    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ]);
    collection.indexBy("field");

    assert.equal(collection.getBy("field", "a"), collection.get(1));
    assert.equal(collection.getBy("field", "b"), collection.get(2));
    assert.equal(collection.getBy("field", "c"), collection.get(3));
    assert.equal(collection.getBy("field", "d"), collection.get(4));
    assert.equal(collection.getBy("field", "e"), collection.get(5));

    next();
  });

  it("Updates index on model change", function(next){

    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ]);
    collection.indexBy("field");

    collection.get(1).set({field: "x"});
    assert.equal(collection.getBy("field", "a"), undefined);
    assert.equal(collection.getBy("field", "x"), collection.get(1));

    next();
  });

  it("Updates index on model remove", function(next){

    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ]);
    collection.indexBy("field");
    collection.add();

    collection.remove(1);
    assert.equal(collection.getBy("field", "a"), undefined);
    next();
  });

  it("Sets index with iterator", function(next){

    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ]);
    collection.indexBy("field", function(model){
      return model.get("field")+"_"+model.id;
    });

    assert.equal(collection.getBy("field", "a_1"), collection.get(1));
    assert.equal(collection.getBy("field", "b_2"), collection.get(2));
    assert.equal(collection.getBy("field", "c_3"), collection.get(3));
    assert.equal(collection.getBy("field", "d_4"), collection.get(4));
    assert.equal(collection.getBy("field", "e_5"), collection.get(5));

    collection.get(1).set({field: "x"});
    assert.equal(collection.getBy("field", "a_1"), undefined);
    assert.equal(collection.getBy("field", "x_1"), collection.get(1));

    next();
  });

  it("dropIndex", function(next){

    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "b" },
      { id: 3, field: "c" },
      { id: 4, field: "d" },
      { id: 5, field: "e" },
    ]);
    collection.indexBy("field", function(model){
      return model.get("field")+"_"+model.id;
    });

    collection.dropIndex("field");

    assert.equal(collection.getBy("field", "a_1"), undefined );
    assert.equal(collection.getBy("field", "b_2"), undefined );
    assert.equal(collection.getBy("field", "c_3"), undefined );
    assert.equal(collection.getBy("field", "d_4"), undefined );
    assert.equal(collection.getBy("field", "e_5"), undefined );

    next();
  });

});
