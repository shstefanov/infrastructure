var App = require("App");

module.exports = require("View").extend({

  template: require("./Layout.ractive.jade"),
  style:    require("./Layout.less"),
  
  components: App.bulk(
    require.context("./sections", true, /\.\/[^/]+\/[^\/]+\.js$/),
    function(name, context, cb){ cb(name.split("/").shift()); }),

});
