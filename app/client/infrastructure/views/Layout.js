// var _ = require("underscore");
module.exports = require("infrastructure-appcontroller-ractive/ractive-backbone-view").extend({
  template: require("./Layout.ractive.jade"),
  style:    require("./Layout.less"),
  
  // setLng: function(lng){
  //   this.get("i18n").setLng(lng, function(err, t){ require("app").set("t", t.bind(window)); });
  // },
  
  components: {
    // SceneComponent:        require("./screens/SceneComponent/SceneComponent.js"            ),
    // MapComponent:          require("./screens/MapComponent/MapComponent.js"                ),
    // TextEditorComponent:   require("./screens/TextEditorComponent/TextEditorComponent.js"  ),
  },


});
