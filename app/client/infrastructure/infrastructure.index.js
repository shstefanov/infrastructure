var App = require("App");  //{  }

App.Controllers = App.bulk(require.context("./controllers"));

App.config({
	whoa: SOME_FUNC,
	debug: true,
	app: {
		// container: "#main-container"
	}
});

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

console.log("hello")