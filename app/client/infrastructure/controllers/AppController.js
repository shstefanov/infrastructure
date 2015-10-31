var _ = require("underscore");

module.exports = require("infrastructure-appcontroller-ractive").extend("AppController", {
  Layout: require("infrastructure.views.Layout"),
  config: "app",
  /*
	Resolved config can contain the following working options:
	container: String // selector, where the app will initialize it's Layout view
	pushState: Boolean



  */

  routes: {
    "setContext": "setContext",
  },

  contaxtParams: ["screen", "tab", "context", "action", "param_1", "param_2", "param_3", "param_4"],

  setContext: function( screen_name, tab, context, action ){
    this.reset( "state", _.chain(this.contaxtParams).zip(arguments).object().value() ); 
  },

});
