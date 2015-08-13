var assert             = require("assert");
var BaseCollection     = require("../../lib/Collection.js");
var ExtendedModel      = require("../../lib/ExtendedModel.js");
var ExtendedCollection = require("../../lib/ExtendedCollection.js");

var TestModel          = ExtendedModel.extend("TestModel", { id_attribute: "id" });
var TestCollection     = ExtendedCollection.extend("TestCollection", { model: TestModel });

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe('ExtendedCollection -> groupBy' + currentFileMark, function(){

  it("Sets collection group by constructor options", function(next){
    var collection = new TestCollection([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ], { group: {field: "field"}} );

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

  it("groupBy array", function(next){
    var GroupedCollection = TestCollection.extend("GroupedCollection", { group: {field: "field"} } );
    var collection = new GroupedCollection([
      { id: 1, field: ["a", "c"] },
      { id: 2, field: ["a", "d"] },
      { id: 3, field: ["b", "c"] },
      { id: 4, field: ["d", "c"] },
      { id: 5, field: ["b", "d"] },
    ]);

    assert.equal(collection.getGroup("field", "a").length, 2 );
    assert.equal(collection.getGroup("field", "b").length, 2 );
    assert.equal(collection.getGroup("field", "c").length, 3 );
    assert.equal(collection.getGroup("field", "d").length, 3 );

    collection.get(1).set({field: ["a", "d"]});
    collection.get(3).set({field: ["b", "d"]});

    assert.equal(collection.getGroup("field", "a").length, 2 );
    assert.equal(collection.getGroup("field", "b").length, 2 );
    assert.equal(collection.getGroup("field", "c").length, 1 );
    assert.equal(collection.getGroup("field", "d").length, 5 );

    collection.get(4).set({field: ["d", "d"]});

    assert.equal(collection.getGroup("field", "d").length, 5 );
    assert.equal(collection.getGroup("field", "c"), undefined);
    next();
  });

  it("Emits group:*name* when new group is created and drop:*name* when group is removed", function(next){
    var collection = new TestCollection([],{ group: {field: "field"}} );

    var created = [];
    var removed = [];
    collection.on("group:field", function(index, group){
      created.push([index, group.length > 0 ]);
    });
    collection.on("dropGroup:field", function(index){
      removed.push(index);
    });

    collection.add([
      { id: 1, field: "a" },
      { id: 2, field: "a" },
      { id: 3, field: "b" },
      { id: 4, field: "b" },
      { id: 5, field: "b" },
    ]);

    assert.deepEqual(created, [
      ["a", true],
      ["b", true],
    ]);

    collection.remove(1);
    assert.deepEqual(removed, []);
    collection.remove(2);
    assert.deepEqual(removed, ["a"]);
    assert.equal(collection.getGroup("field", "a"), undefined );

    var prevModels;
    collection.once("reset", function(collection, options){ prevModels = options.previousModels });

    collection.reset([]);
    assert.deepEqual(removed, ["a", "b"]);
    assert.equal(collection.getGroup("field", "b"), undefined );

    next();
  });

});
