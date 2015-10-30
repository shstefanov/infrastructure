module.exports = require("infrastructure-appcontroller-ractive/ractive-backbone-view").extend({
  template: require("./MainContainer.ractive.jade"),
  style:    require("./MainContainer.less"),
  components: {
    Docs:    require("../Docs/Docs.js"       ),
    Builder: require("../Builder/Builder.js" ),
  }
});
