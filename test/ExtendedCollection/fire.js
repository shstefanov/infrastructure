var assert             = require("assert");
var ExtendedModel      = require("../../lib/ExtendedModel.js");
var ExtendedCollection = require("../../lib/ExtendedCollection.js");

var TestModel          = ExtendedModel.extend("TestModel", { id_attribute: "id" });
var TestCollection     = ExtendedCollection.extend("TestCollection", { model: TestModel });

describe(['ExtendedCollection -> fire', "\n", "[", __filename, "]"].join(""), function(){
  var collection = new TestCollection();
  var model_ids = [ 1, 2, 3, 4, 5];
  var results   = new Array(model_ids.length);

  model_ids.forEach(function(id){
    var model = collection.add({ id: id });
    model.on("custom_event", function(data){
      results[id - 1] = { id: id, data: data };
    });
  });

  it("collection fires event to all models", function(next){
    collection.fire( "custom_event", "custom_data" );
    assert.deepEqual(results, [
      { id: 1, data: "custom_data" },
      { id: 2, data: "custom_data" },
      { id: 3, data: "custom_data" },
      { id: 4, data: "custom_data" },
      { id: 5, data: "custom_data" },
    ]);
    next();
  });

});
