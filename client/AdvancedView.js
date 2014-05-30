
var Backbone = require("backbone");

// Delegates view events from one view to another
// Used for implementing infrastructure match logic
var delegate = function(view, events){
  var self = this;
  var methods = Object.keys(events).map(function(key){return events[key];});
  methods.forEach(function(m){
    if(typeof view[m] === "function") self[m] = function(){view[m].apply(view, arguments);};
  });
};

var parseSelector = function(selector){
  var tag = selector.match(/^[a-z]+/i);
  var tag = tag? tag[0] : "div";

  var ID = selector.match(/#[a-z_\-0-9]+/i);
  ID = ID? (" id='"+ID+"'") : "";

  var className = selector.match(/(\.[a-z_\-0-9]+){1,}/i);
  className = className? (" class='"+className[0].split(".").join(" ").trim()+"'") : "";
  
  var attributes = selector.match(/\((.*)\)/);
  attributes = attributes? (" "+attributes[1]) : "";
  
  return "<"+tag+ID+className+attributes+"></"+tag+">";
}

function createElements(view){
  view.elements = {};
  var els = [];
  for(key in view.templates){
    var parts = key.split("|");
    var parentContainer = parts[0].trim();
    var el = parseSelector(parts[1].trim());
    var $el = $(el);
    els.push($el);
    view.elements[key] = $el;
  }
  view.setElement($.apply(window, els), false);
  //view.el = $.apply(window, els);
}

var renderMultiple = function($view){
  for(key in this.elements){ 
    var template = this.templates[key];
    var $el = this.elements[key];
    if($view){
      if($view===$el) {
        $view.html(template.call(this, this));
        this.trigger("render");
        return this;
      }
    }
    else $el.html(template.call(this, this));
  }
  this.trigger("render");
  return this;
}

var delegateEventSplitter = /^(\S+)\s*(.*)$/;

var emptyObj = {};

var st = {};
["show", "hide", "fadeIn", "fadeOut", "css", "animate"].forEach(function(s){
  st[s] = function(){this.chState(s, arguments);};
});

var View = App.View.extend("AdvancedView", _.extend(st, {

  constructor: function(options){
    
    if(this.controller && typeof this.controller === "string")
      this.controller = app.controllers[this.controller]

    this.infrastructure = {};
    if(options){
      if(options.templates)    {
        this.templates = options.templates;
        delete this.template;
      }
      else if(options.template) this.template = options.template;

      if(options && options.urlRoot) {
        this.urlRoot = options.urlRoot;
      }
    }

    if(this.templates){
      createElements(this);
      this.render = renderMultiple;
    }
    // Also, call of initialize goes here
    App.View.apply(this, arguments);

    if(options && options.style) this.$el.css(options.style);

    if(_.isArray(this.match)){
      var self = this;
      this.match.forEach(function(name){
        if(Infrastructure[name] && Infrastructure[name].infrastructure) 
          Infrastructure[name].infrastructure(self)
      })
    }
    else if(_.isObject(this.match)){
      var self = this;
      for(name in this.match){
        var options = this.match[name];
        if(Infrastructure[name] && Infrastructure[name].infrastructure) 
          Infrastructure[name].infrastructure(self, options)
      }
    }
  },

  setElement: function(element, delegate) {
    if (this.$el) this.undelegateEvents();
    this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
    this.el = this.$el[0];
    if (delegate !== false) this.delegateEvents();
    return this;
  },

  remove: function(){
    if(this.elements) _.invoke(this.elements, "remove");
    else this.$el.remove();
    this.stopListening();
    this.trigger("remove");
    return this;
  },

  undelegateEvents: function() {
    this.elements? _.invoke(this.elements, "off", '.delegateEvents' + this.cid ): this.$el.off('.delegateEvents' + this.cid);
    return this;
  },


  // Edited original backbone method to handle multi view
  delegateEvents: function(events) {
    if (!(events || (events = _.result(this, 'events')))) return this;
    this.undelegateEvents();
    for (var key in events) {
      var method = events[key];
      if (!_.isFunction(method)) method = this[events[key]];
      if (!method) continue;

      var match = key.match(delegateEventSplitter);
      var eventName = match[1], selector = match[2];
      method = _.bind(method, this);
      eventName += '.delegateEvents' + this.cid;
      if (selector === '') {
        this.elements? _.invoke(this.elements, "on", eventName, method): this.$el.on(eventName, method);
      } else {
        this.elements? _.invoke(this.elements, "on", eventName, selector, method): this.$el.on(eventName, selector, method);
      }
    }
    return this;
  },

  match: function(name, options){
    if(Infrastructure[name] && Infrastructure[name].infrastructure) 
      Infrastructure[name].infrastructure(this, options || emptyObj)
  },

  url: function(str){ 
    return (this.urlRoot || "") + (str||"");  },
  URL: function(str){ return this.config.root + (str||""); },
  
  config:   _.clone(window.config),
  settings: _.clone(settings),

  render: function(){
    this.template && this.$el.html(this.template(this));
    this.trigger("render");
    return this;
  },

  getContainer: function(){
    return this.appendTo? this.$(this.appendTo): this.$el;
  },

  append: function(view){
    var self = this;
    if(_.isArray(view)) {
      view.forEach(function(v){self.append(v);});
      return this;
    }
    if(view.templates) return this.appendMulti(view);
    this.getContainer().append(view.render().$el);
    return this;

  },

  appendMulti: function(view){
    var self = this;
    if(_.isArray(view)) {
      view.forEach(function(v){this.appendMulti(view);});
      return this;
    }
    for(key in view.templates){
      var parts = key.split("|");
      var parentContainer = this.getContainer().find(parts[0].trim());
      var $el = view.elements[key];
      parentContainer.append($el);
    }
    view.render();
    return this;
  },

  prepend: function(view){
    var self = this;
    if(_.isArray(view)) {
      view.forEach(function(v){self.prepend(v);});
      return this;
    }
    if(view.templates) return this.prependMulti(view);

    this.getContainer().prepend(view.render().$el);
    return this;

  },

  prependMulti: function(view){
    var self = this;
    if(_.isArray(view)) {
      view.forEach(function(v){self.prependMulti(view);});
      return this;
    }
    view.render();
    for(key in view.templates){
      var parts = key.split("|");
      var parentContainer = this.getContainer().find(parts[0].trim());
      var $el = view.elements[parts[1].trim()];
      parentContainer.prepend($el);
    }
  },

  empty: function(){this.getContainer.empty(); return this;},

  update: function(listenTarget, event, template){
    var liveID = _.uniqueId();
    this
    .once("render", function(){
      var liveElement = this.$("[live='"+liveID+"']");
      liveElement && listenTarget.on(event, function(model, val){
        liveElement.html(template?template(model): val);
      }, liveElement)
      .once("remove", function(){
        listenTarget.off(null,null, liveElement);
      })
    }, this);

    return liveID;

  },

  chState: function(meth, args){ var self = this;
    _.each(this.elements||[this.$el], function(el){el[meth].apply(el, args)});
  },

  

}), { 

  // Class methods
  extend: function(){
    var Result = App.View.extend.apply(this, arguments);
    if(Result.infrastructureName && typeof Result.infrastructure === "function"){
      if(!Infrastructure[Result.infrastructureName]){
        Result.prototype.delegate = delegate;
        Infrastructure[Result.infrastructureName] = Result;
      }
    }
    return Result;
  }

});



module.exports = View;