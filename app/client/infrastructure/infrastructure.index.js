var App = require("App");  //{  }

require("prism");
require("prism.css");

App.Controllers = App.bulk(require.context("./controllers"));

App.config({
  whoa: SOME_FUNC,
  debug: true,
  app: {
    // container: "#main-container"
    pushState: true
  }
});


// console.log(App.Rainbow.color("var App = require('App');", "javascript", function(code){
//   console.log(arguments)
// }));



var app = require("app");

app.init({
  App:          App,
  config:       require("config"),
  settings:     window.settings || {},
  routes:       require("./routes.json"),
  data:         {}
}, function(err){
  if(err) throw err;
  console.log("app initialized");
});
