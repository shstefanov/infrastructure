module.exports = require("View").extend({
  template: require("./MainContainer.ractive.jade"),
  style:    require("./MainContainer.less"),
  components: {
    Docs:              require("../Docs/Docs.js"       ),
    Builder:           require("../Builder/Builder.js" ),
    UnderConstruction: require("../UnderConstruction/UnderConstruction.js" ),
    HelloWorld:        require("../HelloWorld/HelloWorld.js" ),
  }
});
