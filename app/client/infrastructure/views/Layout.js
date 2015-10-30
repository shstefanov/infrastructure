var App = require("App");

module.exports = require("infrastructure-appcontroller-ractive/ractive-backbone-view").extend({

  template: require("./Layout.ractive.jade"),
  style:    require("./Layout.less"),
  
  components: require("App").bulk(
    require.context("./sections", true, /\.\/[^/]+\/[^\/]+\.js$/),
    function(name, context, cb){ cb(name.split("/").shift()); }),

});
