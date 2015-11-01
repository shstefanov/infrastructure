var App = require("App");

// Prism highlighter themes and stuff can be downloaded from http://prismjs.com/download.html

var beautify = require('js-beautify').js_beautify;
// beautify(tag.innerHTML, { indent_size: 2 });

var partials = App.bulk(require.context("./partials", false),function(name, context, cb){ 
  cb(name.replace(/\.ractive\.(jade|html)$/, "").replace(/^i[\d]{1,2}_/, ""));
});

module.exports = require("View").extend({
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

  onrender: function(){
    this.observe("installation_1", function(v){
      console.log("installation_1: ", v);
    })

    this.observe("state.tab", function(val){
      if(!val) return;
      var codes = this.el.querySelectorAll("code");
      if(!codes) return;
      for(var i=0; i< codes.length; i++){
        if(codes[i].className.indexOf("javascript") > -1){
          codes[i].innerHTML = beautify(codes[i].innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">"), { indent_size: 2 });
        }
      }
      Prism.highlightAll();
    })
  }


});
