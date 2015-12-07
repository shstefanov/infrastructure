var Backbone              = require("backbone");
var Class                 = require("./Class");
var Collection            = Backbone.Collection.extend({});
Collection.__className    = "Class_Collection";
Collection.extend         = Class.extend;
module.exports            = Collection;
