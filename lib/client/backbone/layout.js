module.exports = App.AdvancedView.extend("Layout", {
  el: "body",
  events: { "click a": "navigate" },

  navigate: function(event){
    var href = $(event.currentTarget).attr("href") || "";
    if(href.indexOf(config.root)===0){
      app.navigate(href, !event.preventDefault());
    }
  }
});