var partials = require("App").bulk(require.context("./partials", false),function(name, context, cb){ 
  cb(name.replace(/\.ractive\.(jade|html)$/, "").replace(/^i[\d]{1,2}_/, ""));
});

module.exports = require("infrastructure-appcontroller-ractive/ractive-backbone-view").extend({
  template: require("./Docs.ractive.jade"),
  style:    require("./Docs.less"),
  data: {
    items: Object.keys(partials)
  },
  partials: {
    TabPartial: function(){
      return partials[this.get("state.tab")];
    }
  },


});
