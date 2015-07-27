var Page = require("./Page.js");

var Api = Page.extend("Api", {
  render: function(req, res){ res.json(res.data || {}); }
});

module.exports = Api;
