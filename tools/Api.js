

var Page = require("./Page.js");

var Api = Page.extend("Api", {
  render: function(req, res){ res.json(res.data || {}); }
});

delete Api.prototype.assets;
delete Api.prototype.getControllers;
delete Api.prototype.getSubject;

module.exports = Api;
