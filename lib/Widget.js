var Page = require("./Page.js");

var Widget = Page.extend("Widget", {
  isWidget: true,

  "GET /widget.js": function(req, res, next){
    var env = this.env;
    res.send([
      "(function(){",
        "var iframe=document.createElement('iframe');",
        "iframe.src='//"+env.config.hostname+this.root+"/widget';",
        "document.body.appendChild(iframe);",
      "})()"
    ].join(""));
  },

  "GET /widget": function(req, res, next){
    res.send("Hello widget");
  }
  //render: function(req, res){ res.json(res.data || {}); }
});

module.exports = Widget;
