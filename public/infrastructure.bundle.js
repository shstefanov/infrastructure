webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(33);
	module.exports = __webpack_require__(21);


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Ractive    = __webpack_require__(13 );
	// Ractive.DEBUG  = config.ractive.debug;

	var backboneAdaptor      = __webpack_require__( 29 );
	backboneAdaptor.Backbone = __webpack_require__( 28 );

	module.exports = Ractive.extend({ adapt: [ backboneAdaptor ] });


/***/ },
/* 3 */
1,
/* 4 */
/***/ function(module, exports) {

	// Config namespace object
	module.exports = {};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// Main App namespace
	var helpers = __webpack_require__(30);
	var _ = __webpack_require__(8);

	var App = module.exports = {
	  
	  bulk: function(context, iterator){
	    var result = {};
	    return _.chain( context.keys() )
	      .filter(function(path){ return !!path.match(/\.[a-z]{2,6}$/i); }) // Omits module path without extensions
	      .map(function(path){
	        var prop_path = path.replace(/^\.\//, "").replace(/\.js$/i, "");
	        var  prop_name, module;
	        if(iterator){
	          var cb_called = false;
	          iterator(prop_path, context, function(name, mod){
	            prop_name = name, module = arguments.length < 2 ? (name === null ? module : context(path)) : mod;
	          });
	          if(prop_name === null) return null;
	          if(!cb_called) module = context(path);
	          if(prop_name === undefined) prop_name = prop_path;
	        }
	        else{
	          prop_name = prop_path, module = context(path);
	        }
	        return [prop_name, module];
	     }).filter(_.isArray).object().value();
	  },

	  config: function(conf){
	    var config = __webpack_require__(4);
	    _.extend(config, typeof conf === "function" ? App.bulk(conf) : conf );
	  }

	};


/***/ },
/* 6 */,
/* 7 */,
/* 8 */
1,
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);

	module.exports = __webpack_require__(12).extend("AppController", {
	  Layout: __webpack_require__(34),
	  config: "app",

	  routes: {
	    "setContext": "setContext",
	  },

	  contaxtParams: ["screen", "tab", "context", "action", "param_1", "param_2", "param_3", "param_4"],

	  setContext: function( screen_name, tab, context, action ){
	    this.reset( "state", _.chain(this.contaxtParams).zip(arguments).object().value() ); 
	  },

	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(15),
	  style:    __webpack_require__(23),
	  components: {

	  },


	});


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);

	var with_constructor    = "function @@(){return proto.constructor.apply(this, arguments)}";
	var without_constructor = "function @@(){ return parent.apply(this, arguments); };";

	// var extend = function(name, proto, statics){
	  
	//   var parent = this;
	//   if(typeof name === "string" && /^[a-z][a-z0-9]*$/i.test(name)){
	//     name = name;
	//   }
	//   else{
	//     statics = proto;
	//     proto = name;
	//     name = "child";
	//   }

	//   name = (parent.__className) || "child"+"_"+name;

	//   // The constructor function for the new subclass is either defined by you
	//   // (the "constructor" property in your `extend` definition), or defaulted
	//   // by us to simply call the parent's constructor.

	//   // if (protoProps && _.has(protoProps, 'constructor')) { //first call parent's constructor, then current
	//   //   eval("function "+name+"(){return protoProps.constructor.apply(this, arguments)}");
	//   // } else {
	//   //   eval("function "+name+"(){ return parent.apply(this, arguments); };");
	//   // }

	//   eval((proto && _.has(proto, 'constructor')?with_constructor:without_constructor).replace("@@", name))
	//   var child = eval(name);

	//   // Add static properties to the constructor function, if supplied.
	//   _.extend(child, parent, statics);

	//   // Set the prototype chain to inherit from `parent`, without calling
	//   // `parent`'s constructor function.
	//   var Surrogate = function(){
	//     this.constructor = child; 
	//   };

	//   Surrogate.prototype = parent.prototype;
	//   child.prototype = new Surrogate;
	//   child.__className = (statics || {}).__className || name;

	//   // Add prototype properties (instance properties) to the subclass,
	//   // if supplied.
	//   if (proto) _.extend(child.prototype, proto);

	//   // Set a convenience property in case the parent's prototype is needed
	//   // later.
	//   child.__super__ = parent.prototype;

	//   return eval(name);
	// };

	var Class = function(){
	  if(this.initialize) this.initialize.apply(this, arguments);
	};
	Class.__className = "Class";
	// minified version will work faster
	Class.extend = function(name,proto,statics){var parent=this;"string"==typeof name&&/^[a-z][a-z0-9]*$/i.test(name)?name=name:(statics=proto,proto=name,name="child"),name=parent.__className||"child_"+name,eval((proto&&_.has(proto,"constructor")?with_constructor:without_constructor).replace("@@",name));var child=eval(name);_.extend(child,parent,statics);var Surrogate=function(){this.constructor=child};return Surrogate.prototype=parent.prototype,child.prototype=new Surrogate,child.__className=(statics||{}).__className||name,proto&&_.extend(child.prototype,proto),child.__super__=parent.prototype,eval(name)};

	module.exports = Class;




	// Original extend function in case evaluating class names is not good idea
	// var _ = require("underscore");

	// var extend = function(protoProps, staticProps) {
	//   var parent = this;
	//   var child;

	//   // The constructor function for the new subclass is either defined by you
	//   // (the "constructor" property in your `extend` definition), or defaulted
	//   // by us to simply call the parent's constructor.
	//   if (protoProps && _.has(protoProps, 'constructor')) {
	//     child = protoProps.constructor;
	//   } else {
	//     child = function(){ return parent.apply(this, arguments); };
	//   }

	//   // Add static properties to the constructor function, if supplied.
	//   _.extend(child, parent, staticProps);

	//   // Set the prototype chain to inherit from `parent`, without calling
	//   // `parent`'s constructor function.
	//   var Surrogate = function(){ this.constructor = child; };
	//   Surrogate.prototype = parent.prototype;
	//   child.prototype = new Surrogate;

	//   // Add prototype properties (instance properties) to the subclass,
	//   // if supplied.
	//   if (protoProps) _.extend(child.prototype, protoProps);

	//   // Set a convenience property in case the parent's prototype is needed
	//   // later.
	//   child.__super__ = parent.prototype;

	//   return child;
	// };

	// var Class = function(){
	//   if(this.initialize) this.initialize.apply(this, arguments);
	// };
	// Class.prototype.extend = extend;

	// module.exports = Class;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _            = __webpack_require__(3);
	var helpers      = __webpack_require__(44); 
	var Controller   = __webpack_require__(42);
	var Router       = __webpack_require__(43);

	/*
	  // Every controller can:
	  {

	    data: {...},  // attach data to main data namespace
	    
	    routes: {
	      route_name: "method" or ["method", "method_2"],
	    },

	    observe: {
	      dataPath: "method" or ["method", "method_2"],
	    },

	    events: {
	      event_name: "method" or ["method", "method_2"],
	    },

	    config: "config.path" or { ... }

	  }
	*/

	module.exports = Controller.extend("BaseRactiveAppController", {

	  init: function(options, cb){
	    var self = this;
	    if(!document.body){
	      window.onload = function(){
	        self.init(options, cb);
	      }
	      return;
	    }
	    var app_config = {};
	    if(this.config) app_config = helpers.resolve(options.config, this.config);

	    this.options  = options;
	    this.config   = options.config;
	    this.settings = options.settings;

	    this.setupRouter(options);

	    helpers.chain([

	      function(cb){
	        if(this.Layout){
	          var container = app_config.container;
	          var element;
	          if(!container) element = document.body;
	          else           element = document.querySelector(container);
	          var self = this;
	          this.layout = new (this.Layout)({
	            data: options.data,
	            el:   element,
	            onrender: function(){ self.layout = this; cb(); }
	          });

	        }
	        else cb();  
	      },

	      function(cb){ this.setupControllers(cb); },

	      function(cb){
	        this.router.bindRoutes(this.routes);
	        this.router.startHistory();
	        this.trigger("ready");
	        cb();
	      }

	    ])(cb, this);

	  },

	  setupRouter: function(options){
	    this.router = new Router(options.routes);
	  },

	  setupControllers: function(cb){
	    var self       = this;
	    var App        = this.options.App;
	    var observers  = [];
	    var data       = this.options.data;
	    var config     = this.config;

	    this.routes && this.bindRoutes(this);

	    if(this.data) _.extend(data, this.data );

	    var controllerNames = _.without(_.keys(App.Controllers), "AppController");
	    controllerNames = _.sortBy(controllerNames, function(controllerName){
	      return typeof App.Controllers[controllerName].prototype.initOrder === "number"
	        ? App.Controllers[controllerName].prototype.initOrder
	        : controllerNames.length;
	    });
	    var initChain = controllerNames.map(function(controllerName){
	      var controllerPrototype = App.Controllers[controllerName];

	      if(controllerPrototype.prototype.config){
	        if(_.isString(controllerPrototype.prototype.config)){
	          controllerPrototype.prototype.config = helpers.resolve(config, controllerPrototype.prototype.config);
	        }
	      }

	      if(controllerPrototype.prototype.data) self.set(controllerPrototype.prototype.data );
	      var controller = self[controllerName] = new controllerPrototype();
	      controller.routes && controller.bindRoutes(self);
	      controller.app = self;
	      if(controller.observe && self.bindObserver){
	        observers.push(controller);
	      }
	      return controller;
	    }).map(function(controller){
	      if(!controller.init || controller.init.length!=2) return function(cb){
	        controller.init.call(controller, self.options);
	        cb();
	      }
	      return function(cb){
	        controller.init.call(controller, self.options, cb );
	      }
	    });

	    helpers.chain(initChain)(function(err){
	      if(err) return cb(err);
	      if(observers.length > 0){
	        observers.forEach(function(observer){
	          self.bindObserver(observer);
	        });
	      }
	      cb();
	    });
	  },

	  bindObserver: function(observer){
	    for(var key in observer.observe){
	      if(typeof observer[observer.observe[key]] === "function"){
	        this.observe( key, observer[observer.observe[key]].bind(observer) );
	      }
	    }
	  },

	  get:          function(){ return   this.layout.get          .apply(this.layout, arguments);              },
	  fetch:        function(){ return   this.layout.fetch        .apply(this.layout, arguments);              },
	  set:          function(){          this.layout.set          .apply(this.layout, arguments); return this; },
	  observe:      function(){          this.layout.observe      .apply(this.layout, arguments); return this; },
	  toggle:       function(){          this.layout.toggle       .apply(this.layout, arguments); return this; },
	  radioToggle:  function(){          this.layout.radioToggle  .apply(this.layout, arguments); return this; },
	  reset:        function(path, val){ this.layout.set(path, null); this.layout.set(path, val);              },
	  navigate:     function(path){      this.router.navigate(path.replace(/^\//, ""), true ) },


	});


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _          = __webpack_require__(3);
	var Ractive    = __webpack_require__(7 );

	var config     = __webpack_require__(4);
	Ractive.DEBUG  = config.debug;

	module.exports = Ractive.extend({

	  data:{
	    
	    condition: function(condition, val_1, vl_2){
	      return condition ? val_1 : (vl_2 || null);
	    },

	    resolveComponent: function(name, properties){
	      if(this.partials[name]) {
	        if(properties) this.bindComponentVars(this.partials[name], properties );
	        return name;
	      }
	      var component, partial, components = this.__proto__.constructor.components;
	      try{
	        if(!components[name]) throw new Error("Component not found");
	        partial   = { "v":3, "t": [{ "t":7, "e": name } ] };
	        this.partials[name]   = partial;
	        if(properties) this.bindComponentVars(partial, properties );
	      }
	      catch(err){
	        this.partials[name] = {"v":3,"t":[{"t":7,"e":"p","a":{"class":"alert alert-danger"},"f":["Error: Component at '"+name+"'' can't be resolved"]}]};
	      }
	      return name;
	    }

	  },

	  oninit: function() {
	    if(this.initialize) { this.initialize(); }
	  },

	  bindComponentVars: function(partial, properties){
	    partial.t[0].a = _.mapObject(properties, function(val){ return [ { "t":2, "r": val } ]; });
	  },

	  toggle: function(path){
	    var paths = Array.prototype.slice.call(arguments);
	    for(var i=0;i<paths.length;i++){
	      this.set(paths[i], !this.get(paths[i]));
	    }
	  },

	  fetch: function(obj){
	    var result = {};
	    for(var key in obj) {
	      var target = obj[key];
	      if(target.indexOf("*")){
	        var parts = target.split(/[.\[]\*[.\]]/);
	        var targetObj = this.get(parts[0]);
	        if(!target[1]){
	          result[key] = targetObj;
	        }
	        else if(_.isArray(targetObj)){
	          result[key] = new Array(targetObj.length);
	          for(var i=0;i<targetObj.length;i++){
	            result[key][i] = this.get(target.replace("*", i));
	          }
	        }
	        else if(_.isObject(targetObj)){
	          result[key] = {};
	          for(var targetKey in targetObj){
	            result[key][targetKey] = this.get(target.replace("*", targetKey));
	          }
	        }
	        else{
	          result[key] = targetObj;
	        }
	      }
	      else{
	        result[key] = this.get(target);
	      }
	    }
	    return result;
	  },

	  radioToggle: function(path){
	    var parts      = path.split(".");
	    var parentPath = parts.slice(0,-1).join(".");
	    var target     = parts.slice(-1).pop();
	    var active     = this.get(parentPath+".__active");
	    if(active){
	      this.toggle(parentPath+"."+active);
	    }
	    if(target === active){
	      this.set(parentPath+".__active", null);
	      return this;
	    }
	    else{
	      this.set(parentPath+".__active", target);
	      this.toggle(path);
	    }
	    return this;
	  }



	});


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"container fixed-header"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"Header\",{state:\"state\"})"}}]}]},{"t":7,"e":"div","a":{"class":"after-fixed"}},{"t":7,"e":"div","a":{"class":"fluid-container fixed-menu"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"TopMenu\",{state:\"state\",search_input:\"search_input\"})"}}]}]},{"t":7,"e":"div","a":{"class":"after-fixed"}},{"t":7,"e":"div","a":{"class":"fluid-container"},"f":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"MainContainer\",{state:\"state\"})"}}]}]}]},{"t":7,"e":"div","a":{"class":"container"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"Footer\",{state:\"state\"})"}}]}]}]};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"col-xs-2"},"f":[{"t":7,"e":"div","a":{"class":"fixed-sidebar"},"f":["Builder sidebar here",{"t":7,"e":"br"},{"t":2,"r":"search_input"}]},{"t":7,"e":"div","a":{"class":"after-fixed"}}]},{"t":7,"e":"div","a":{"class":"col-xs-10"},"f":[{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]}]}]};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":["Footer"]}]};

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":["Infrastructure"]}]};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":8,"x":{"r":["resolveComponent","state"],"s":"_0(_1.screen===\"docs\"?\"Docs\":_1.screen===\"build\"?\"Builder\":\"NotFount\",{state:\"state\",search_input:\"search_input\"})"}}]}]};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":7,"e":"form","a":{"class":"col-xs-2"},"f":[{"t":7,"e":"div","a":{"class":"form-group"},"f":[{"t":7,"e":"input","a":{"type":"text","placeholder":"Search","value":[{"t":2,"r":"search_input"}],"class":"form-control"}}]}]},{"t":7,"e":"div","a":{"class":"pull-right col-xs-4"},"f":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":7,"e":"div","a":{"class":"pull-right col-xs-2"},"f":[{"t":7,"e":"a","a":{"href":"/infrastructure/build","class":["btn btn-default ",{"t":2,"x":{"r":["condition","state.screen"],"s":"_0(_1===\"build\",\"active\")"}}]},"f":["Build"]}]},{"t":7,"e":"div","a":{"class":"pull-right col-xs-2"},"f":[{"t":7,"e":"a","a":{"href":"/infrastructure/docs/Installation","class":["btn btn-default ",{"t":2,"x":{"r":["condition","state.screen"],"s":"_0(_1===\"docs\",\"active\")"}}]},"f":["Docs"]}]}]}]}]}]};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(5);

	module.exports = new App.Controllers.AppController();

	var config = __webpack_require__(4);

	if(config.debug === true) {
		window.app    = module.exports; 
		window.App    = App;
		window.config = config;
	}

/***/ },
/* 21 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 22 */
21,
/* 23 */
21,
/* 24 */
21,
/* 25 */
21,
/* 26 */
21,
/* 27 */
21,
/* 28 */
[78, 3, 3],
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	var _ = __webpack_require__(3);

	(function (global, factory) {
		 true ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		global.Ractive.adaptors.Backbone = factory()
	}(this, function () { 'use strict';

		var lockProperty = "_ractiveAdaptorsBackboneLock";

		function acquireLock(key) {
			key[lockProperty] = (key[lockProperty] || 0) + 1;
			return function release() {
				key[lockProperty] -= 1;
				if (!key[lockProperty]) {
					delete key[lockProperty];
				}
			};
		}

		function isLocked(key) {
			return !!key[lockProperty];
		}

		var adaptor = {
			// self-init, if being used as a <script> tag
			Backbone: typeof window !== "undefined" && window.Backbone || null,

			filter: function filter(object) {
				if (!adaptor.Backbone) {
					throw new Error("Could not find Backbone. You must do `adaptor.Backbone = Backbone` - see https://github.com/ractivejs/ractive-adaptors-backbone#installation for more information");
				}
				return object instanceof adaptor.Backbone.Model || object instanceof adaptor.Backbone.Collection;
			},
			wrap: function wrap(ractive, object, keypath, prefix) {
				if (object instanceof adaptor.Backbone.Model) {
					return new BackboneModelWrapper(ractive, object, keypath, prefix);
				}

				return new BackboneCollectionWrapper(ractive, object, keypath, prefix);
			}
		};

		function BackboneModelWrapper(ractive, model, keypath, prefix) {
			this.value = model;

			model.on("change", this.modelChangeHandler = function () {
				var release = acquireLock(model);
				ractive.set(prefix(model.changed));
				release();
			});
		}

		BackboneModelWrapper.prototype = {
			teardown: function teardown() {
				this.value.off("change", this.modelChangeHandler);
			},
			get: function get() {
				return this.value.toJSON();
			},
			set: function set(keypath, value) {
				// Only set if the model didn't originate the change itself, and
				// only if it's an immediate child property
				if (!isLocked(this.value) && keypath.indexOf(".") === -1) {
					this.value.set(keypath, value);
				}
			},
			reset: function reset(object) {
				// If the new object is a Backbone model, assume this one is
				// being retired. Ditto if it's not a model at all
				if (object instanceof adaptor.Backbone.Model || !(object instanceof Object)) {
					return false;
				}

				// Otherwise if this is a POJO, reset the model
				//Backbone 1.1.2 no longer has reset and just uses set
				this.value.set(object);
			}
		};

		function BackboneCollectionWrapper(ractive, collection, keypath) {
			this.value = collection;

			collection.on("add remove reset sort", this.changeHandler = function () {
				// TODO smart merge. It should be possible, if awkward, to trigger smart
				// updates instead of a blunderbuss .set() approach
				var release = acquireLock(collection);
				ractive.set(keypath, collection.models);
				release();
			});
		}

		BackboneCollectionWrapper.prototype = {
			teardown: function teardown() {
				this.value.off("add remove reset sort", this.changeHandler);
			},
			get: function get() {
				return this.value.models;
			},
			reset: function reset(models) {
				if (isLocked(this.value)) {
					return;
				}

				// If the new object is a Backbone collection, assume this one is
				// being retired. Ditto if it's not a collection at all
				if (models instanceof adaptor.Backbone.Collection || Object.prototype.toString.call(models) !== "[object Array]") {
					return false;
				}

				// Otherwise if this is a plain array, reset the collection
				this.value.reset(models);
			}
		};

		var ractive_adaptors_backbone = adaptor;

		return ractive_adaptors_backbone;

	}));


/***/ },
/* 30 */
[46, 8],
/* 31 */
/***/ function(module, exports) {

	module.exports = {
		"/": "setContext",
		"/:screen": "setContext",
		"/:screen/:tab": "setContext",
		"/:screen/:tab/:context": "setContext",
		"/:screen/:tab/:context/:action": "setContext"
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./AppController": 9,
		"./AppController.js": 9
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 32;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(5);  //{  }

	App.Controllers = App.bulk(__webpack_require__(32));

	App.config({
		whoa: (function (){ console.log("WHOAAAAAA!!!") }),
		debug: true,
		app: {
			// container: "#main-container"
		}
	});

	var app = __webpack_require__(20);

	app.init({
	  App:          App,
	  config:       __webpack_require__(4),
	  settings:     window.settings || {},
	  routes:       __webpack_require__(31),
	  data:         {}
	}, function(err){
	  if(err) throw err;
	  console.log("app initialized");
	});


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(5);

	module.exports = __webpack_require__(2).extend({

	  template: __webpack_require__(14),
	  style:    __webpack_require__(22),
	  
	  components: App.bulk(
	    __webpack_require__(35),
	    function(name, context, cb){ cb(name.split("/").shift()); }),

	});


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./Builder/Builder.js": 10,
		"./Docs/Docs.js": 36,
		"./Footer/Footer.js": 37,
		"./Header/Header.js": 38,
		"./MainContainer/MainContainer.js": 39,
		"./TopMenu/TomMenu.js": 40
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 35;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var partials = __webpack_require__(5).bulk(__webpack_require__(50),function(name, context, cb){ 
	  cb(name.replace(/\.ractive\.(jade|html)$/, "").replace(/^i[\d]{1,2}_/, ""));
	});

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(51),
	  style:    __webpack_require__(49),
	  data: {
	    items: Object.keys(partials)
	  },
	  partials: {
	    TabPartial: function(){
	      return partials[this.get("state.tab")];
	    }
	  },


	});


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(16),
	  style:    __webpack_require__(24),
	  components: {

	  },


	});


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(17),
	  style:    __webpack_require__(25),
	  components: {

	  },


	});


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(18),
	  style:    __webpack_require__(26),
	  components: {
	    Docs:    __webpack_require__(36       ),
	    Builder: __webpack_require__(10 ),
	  }
	});


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(19),
	  style:    __webpack_require__(27),
	  components: {

	  },


	});


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	
	var Backbone = __webpack_require__(77);
	var Class = __webpack_require__(11);

	var _ = __webpack_require__(1);

	var EventedClass = Class.extend("EventedClass", _.extend(Backbone.Events, {
	  
	  // EventedClass's constructor handles props like:
	  // events:{
	  //   "event_name": "method name",
	  //   "evt": ["method1", "method2", function(){}],
	  //   "event": function(){ ... }
	  // }

	  constructor: function(){
	    if(_.isObject(this.events)){
	      for(event in this.events){ var evt = this.events[event];
	        
	        if(_.isFunction(evt)) this.on(event, evt, this);
	        
	        else if(_.isString(evt) && _.isFunction(this[evt])){
	          this.on(event, this[evt], this);
	        }
	        
	        else if(_.isArray(evt)){
	          for(var i = 0;i< evt.length;i++){ var meth = evt[i];
	            if(_.isString(meth) && _.isFunction(this[meth])){
	              this.on(event, this[meth], this);
	            }
	            else if(_.isFunction(meth)){
	              this.on(event, meth, this);
	            }
	          }
	        }
	      }
	    }
	    Class.apply(this, arguments);
	  }

	}), Backbone.Events);
	module.exports = EventedClass;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var EventedClass = __webpack_require__(41);

	module.exports = EventedClass.extend("Controller", {

	  bindRoutes: function(app){
	    for(var key in this.routes){
	      var handlerName = this.routes[key];
	      if(Array.isArray(handlerName)){
	        for(var i=0;i<handlerName.length;i++){
	          if(_.isFunction(this[handlerName[i]])){
	            app.router.on("route:"+key, this[handlerName[i]], this);
	          }
	        }
	      }
	      else{
	        if(_.isFunction(this[handlerName])){
	          app.router.on("route:"+key, this[handlerName], this);
	        }
	      }
	    }
	  }
	});


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// Backbone router needs jQuery to select 'window' and to attach 2 events to it
	// Creating simple mockup

	var Backbone               = __webpack_require__(77);
	var Class                  = __webpack_require__(11);

	var jQueryMockup = {
	  on: function(event, handler){
	    this.el.addEventListener(event, handler);
	    return jQueryMockup;
	  },
	  off: function(event, handler){
	    this.el.removeEventListener(event, handler);
	    return jQueryMockup;
	  }
	};

	Backbone.$ = function(el){
	  jQueryMockup.el = el;
	  return jQueryMockup;
	}

	function getLink(elem){
	  if(elem.nodeName === "A") return elem;
	  else if(!elem.parentNode) return null;
	  else return getLink(elem.parentNode);
	}

	function getHref(elem, rootPath){
	  if(!elem || !elem.href) return false;
	  var href = elem.getAttribute("href");
	  if( href.indexOf( "/" ) === 0 ){
	    if( href.indexOf(rootPath) === 0 ) return href.replace(/^\//, "");
	    else return false;
	  }
	  else if( href.indexOf( "javascript:" ) === -1 ) return rootPath + "/" + href;
	  return false;
	}

	var BaseRouter = Backbone.Router.extend({
	  
	  initialize: function(routes){
	    this.routes = routes;
	    var config  = __webpack_require__(4);
	    var router  = this;
	    var rootPath = document.getElementsByTagName("base")[0].href.replace(window.location.origin, ""); //config.router.base_path || "";
	    this.rootPath = rootPath.replace(/^\/+/, "");
	    document.body.addEventListener("click", function(e){
	      var href = getHref(getLink(e.target), rootPath);
	      if(href) {
	        e.preventDefault();
	        router.navigate(href, true);
	      }
	    });
	  },

	  startHistory: function(){
	    Backbone.history.start({pushState: true});
	  },

	  back: function(n){
	    Backbone.history.back(n || -1);
	  },

	  bindRoutes: function(){
	    var rootPath = this.rootPath;
	    for(var routePath in this.routes){
	      var routeName = this.routes[routePath];
	      if(Array.isArray(routeName)){
	        for(var i=0;i<routeName.length;i++){
	          this.route((rootPath+"/"+routePath).replace(/^\/+/,"").replace(/\/+$/,"").replace(/\/+/,"/"), routeName[i]);
	        }
	      }
	      else{
	        this.route((rootPath+"/"+routePath).replace(/^\/+/,"").replace(/\/+$/,"").replace(/\/+/,"/"), routeName);
	      }
	    }
	  }

	});

	BaseRouter.__className = "Router";
	BaseRouter.extend      = Class.extend;
	module.exports         = BaseRouter;





/***/ },
/* 44 */
[46, 1],
/* 45 */,
/* 46 */
/***/ function(module, exports, __webpack_require__, __webpack_module_template_argument_0__) {

	/* WEBPACK VAR INJECTION */(function(global) {var _ = __webpack_require__(__webpack_module_template_argument_0__);
	var helpers = module.exports = {
	  
	  everyIs: function(iterator){ return function(val){ return _.isArray(val) && _.every(val, iterator);} },

	  isOneOf: function(){
	    var comparators = Array.prototype.slice.call(arguments);
	    return function(val){
	      return _.some(comparators, function(comparator){
	        return comparator(val);
	      });
	    }
	  },

	  deepExtend: function(target, source){
	    for(var key in source){
	      if(_.isObject(target[key]) && _.isObject(source[key])){
	        helpers.deepExtend(target[key], source[key]);
	      }
	      else { target[key] = source[key]; }
	    }
	  },

	  filterObject: function(obj, iterator){
	    var result = {};
	    for(key in obj)
	      !!iterator(key, obj[key]) && (result[key] = obj[key]);
	    return result;
	  },

	  //Warning !!! - changing passed object
	  cleanObject: function(obj){ for(key in obj) !obj[key] && (delete obj[key]); },

	  // Takes number n and returns function that can be executed n times
	  // when n becomes 0, will be executed callback m in context C with arguments a,b and c
	  counter: function(n,m,C,a,b,c){return function(){n--;n===0&&m.call(C||this,a,b,c)}},
	  
	  // Generates a chain of functions
	  chain: function(fns, context){
	    var self = this;
	    fns = fns.map(function(f){
	      if(typeof f !== "function") {
	        return function(){
	          var ctx = this;
	          var args = Array.prototype.slice.call(arguments);
	          var chain_cb = args.pop();
	          helpers.amap(f, function(ob_fn, amap_cb){
	            ob_fn.apply(ctx, args.concat([amap_cb]));
	          }, chain_cb);
	        };
	      }
	      else{
	        return f;
	      }
	    });

	    var ft = "function", sl = [].slice, em = "callback not found!!";
	    return function(){var t,n=context||this,a=fns,r=-1,f=sl.call(arguments);if(t=f.pop(),typeof t!==ft&&(n=t,t=f.pop()),typeof t!==ft)throw new Error(em);var l=function(){var f=arguments[0];if(f)return t(f);if(!a[++r])return t.apply(n,arguments);try{a[r].apply(n,sl.call(arguments,1).concat([l]))}catch(f){t.call(n,f)}};l.finish=t,fns.length?(r++,f.push(l),fns[0].apply(n,f)):(f.unshift(null),t.apply(n,f))};
	    // return function(){
	    //   var cb,c=context||this,ch=fns,ptr=-1;
	    //   var a=sl.call(arguments);
	    //   cb = a.pop();
	    //   if(typeof cb!==ft) c=cb,cb=a.pop();
	    //   if(typeof cb!==ft) throw new Error(em);
	    //   var n=function(){
	    //     var e=arguments[0];
	    //     if(e) return cb(e);
	    //     if(!ch[++ptr]) return cb.apply(c, arguments);
	    //     try{ch[ptr].apply(c,sl.call(arguments,1).concat([n]));}
	    //     catch(e){cb.call(c,e);}
	    //   }
	    //   n.finish=cb;
	    //   if(fns.length){
	    //     ptr++;
	    //     a.push(n);
	    //     fns[0].apply(c,a);
	    //   }
	    //   else{
	    //     a.unshift(null);
	    //     cb.apply(c,a);
	    //   }
	    // };

	  },

	  amapCompose: function(obj, iterator){
	    return function(ob, itr, cb){
	      helpers.amap( ob||obj, itr||iterator, cb, this);
	    }
	  },

	  runFnsIterator: function(fn, cb){fn(cb);},
	  amap: function(r,n,t,a){a=a||this,n?Array.isArray(n)&&(n=this.chain(n)):n=this.runFnsIterator;var i,e;if(Array.isArray(r)?(e=r.length,i=new Array(r.length)):(i={},e=Object.keys(r).length,r.forEach=function(n){for(var t in r)"forEach"!==t&&n(r[t],t,r)}),0===e)return t(null,r);var f;r.forEach(function(r,c){setTimeout(function(){n.call(a,r,function(r,n){if(f!==!0){if(r)return f=!0,t(r);i[c]=n,e--,0===e&&t(null,i)}})},0)}),Array.isArray(r)||delete r.forEach},
	  // amap: function(arr, iterator, cb, ctx){
	  //   ctx = ctx || this;
	  //   if(!iterator) iterator = this.runFnsIterator;
	  //   else if(Array.isArray(iterator)) iterator = this.chain(iterator);
	  //   var results, counter;
	  //   if(!Array.isArray(arr)){
	  //     results = {};
	  //     counter = Object.keys(arr).length;
	  //     arr.forEach = function(itr){
	  //       for(var key in arr) {
	  //         if(key==="forEach") continue;
	  //         itr(arr[key], key, arr);
	  //       }
	  //     }
	  //   }
	  //   else{
	  //     counter = arr.length;
	  //     results = new Array(arr.length);
	  //   }
	  //   if(counter===0) return cb(null, arr);

	  //   var  error;
	  //   arr.forEach(function(el, idx, arr){
	  //     setTimeout(function(){
	  //       iterator.call(ctx, el, function(err, result){
	  //         if(error === true) return;
	  //         if(err){error = true; return cb(err);}
	  //         results[idx] = result;
	  //         counter--;
	  //         if(counter===0) {
	  //           cb(null, results);
	  //         }
	  //       });
	  //     }, 0);
	  //   });
	  //   if(!Array.isArray(arr)) delete arr.forEach;
	  // },

	  parseArgs: function(a){
	    var r    = { params: Array.prototype.call.slice(a), ctx: global};
	    var last = Array.prototype.call.slice(a, -2);
	    var l1   = last.pop();
	    var l2   = last.pop();
	    if(typeof l1 === "function"){
	      r.cb   = r.params.pop();
	      return r;
	    }
	    else if(typeof l2 === "function"){
	      r.ctx  = r.params.pop();
	      r.cb   = r.params.pop();
	      return r;
	    }
	    return r;
	  },

	  defaultize: function(base, target){
	    if(Array.isArray(target)) target.forEach(function(t){_.defaults(t, base)});
	    else{
	      for(var key in target){
	        _.defaults(target[key], base);
	      }
	    }
	    return target;
	  },

	  instantiate: function(objects, Prototype){
	    if(_.isArray(objects)){
	      return objects.map(function(object){
	        return new Prototype(object);
	      });
	    }
	    else if(_.isObject(objects)){
	      var result = {};
	      for(var key in objects){
	        result[key] = new Prototype(objects[key]);
	      }
	      return result;
	    }
	    else{
	      return new Prototype(objects);
	    }
	  },

	  traverse: function(obj, iterator, path){
	    path = path || [];
	    for(var key in obj){
	      (function(name, val){
	        if(_.isObject(val) && (typeof val !== "function")){
	          return helpers.traverse(val, iterator, path.concat([name]));
	        }
	        iterator(val, name, obj, path.concat([name]));
	      })(key, obj[key]);
	    }
	  },

	  resolve: function(target, path){
	    var parts = path.split("."), parent = target, last_target = parts.pop();
	    for(var i = 0; i< parts.length; i++){
	      if(!parent.hasOwnProperty(parts[i]) && !parent.__proto__.hasOwnProperty(parts[i])){
	        return undefined;
	      }
	      parent = parent[parts[i]];
	    }
	    return parent[last_target];
	  },

	  patch: function(target, path, val){
	    if(typeof path === "object"){
	      for(var key in path) helpers.patch(target, key, path[key]);
	      return;
	    }
	    var parts = path.split("."), parent = target, last = parts.pop();
	    for(var i = 0; i< parts.length; i++){
	      if(!parent.hasOwnProperty(parts[i]) && !parent.__proto__.hasOwnProperty(parts[i])) parent[parts[i]] = {};
	      parent = parent[parts[i]];
	    }
	    var real_target = (!parent[last] && !parent.__proto__[last] ? parent : ( !parent.__proto__[last] ? parent : parent.__proto__ ) );
	    real_target[last] = val;
	  }

	};

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 47 */,
/* 48 */,
/* 49 */
21,
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./i1_Installation.ractive.jade": 57,
		"./i2_Configuration.ractive.jade": 59
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 50;


/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"col-xs-2"},"f":[{"t":7,"e":"div","a":{"class":"fixed-sidebar"},"f":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":4,"f":[{"t":7,"e":"a","a":{"href":["/infrastructure/",{"t":2,"r":"state.screen"},"/",{"t":2,"r":"."}],"class":["sidebar-item col-xs-10 ",{"t":2,"x":{"r":["condition","state.tab","."],"s":"_0(_1===_2,\"active\")"}}]},"f":[{"t":2,"r":"."}]}],"r":"items"}]}]},{"t":7,"e":"div","a":{"class":"after-fixed"}}]},{"t":7,"e":"div","a":{"class":"col-xs-10"},"f":[{"t":8,"r":"TabPartial"}]}]};

/***/ },
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":["Installation"]}]};

/***/ },
/* 58 */,
/* 59 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":["Configuration"]}]};

/***/ }
]);