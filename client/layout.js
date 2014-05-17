

module.exports = App.AdvancedView.extend("Layout", {
  el: "body",
  events: {
    "click a": "navigate"
  },

  navigate: function(event){
    var href = $(event.currentTarget).attr("href") || "";
    if(!href.match(/^(https?:\/\/|ftp:\/\/|mailto:\/\/|javascript:)/) ){
      event.preventDefault();
      app.navigate(href, true);
    }
  }
});