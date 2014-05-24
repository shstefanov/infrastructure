
var Class = require("./Class");
var Backbone = require("backbone");

var AdvancedModel = Backbone.Model.extend({});
AdvancedModel.__className = "Class_Model_AdvancedModel";
AdvancedModel.extend = Class.extend;

module.exports = AdvancedModel;