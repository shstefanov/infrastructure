var Class                 = require("./Class");
var Backbone              = require("backbone");
var Model                 = Backbone.Model.extend({});
Model.__className         = "Class_Model";
Model.extend              = Class.extend;
module.exports            = Model;
