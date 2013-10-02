appendToInitialize = ->
  @empty = =>
    if @appendTo == "."
      @$el.empty()
    else
      @$(@appendTo).empty()
    @
  @append = (view)=>
    add = (v)=>
      if !v
        @$el.css {'background-color': 'red'}
      if @appendTo == "."
        @$el.append(v.render().$el)
      else
        @$(@appendTo).append(v.render().$el)
    if(Array.isArray(view))
      view.forEach add
    else
      add view
    @
  @prepend = (view)=>
    add = (v)=>
      if !v
        @$el.css {'background-color': 'red'}
      if @appendTo == "."
        @$el.prepend(v.render().$el)
      else
        @$(@appendTo).prepend(v.render().$el)
    if(Array.isArray(view))
      view.forEach add
    else
      add view
    @
# {model:model, viewPrototype:prototype, view_id: unique_view_id}

getWrapper = (proto)->
  tag = 'div'
  id = ''
  classes = ''
  attrs = []
  if proto.prototype.attributes
    Object.keys(proto.prototype.attributes).forEach (attr)->
      if attr == 'id'
        id = "#"+attr
      else
        attrs.push "#{attr}='#{proto.prototype.attributes[attr]}'"
  if proto.prototype.tagName
    tag = proto.prototype.tagName
  if proto.prototype.className
    proto.prototype.className.split(" ").forEach (cl)->
      classes+="."+cl
  wrapper = tag+classes
  if attrs.length > 0
    wrapper+="("+attrs.join(",")+")"
  return wrapper

forInitialize = []

module.exports = Backbone.View.extend
  local: {}
  initialize: (options)->

    {@model, @collection} = options if options
    if @model
      @model.on "change save", @render, @ 
      @model.on "destroy", @remove, @ 
    if @collection
      @collection.on "add remove reset", @render, @
    
    if(options && options.appendTo)
      @appendTo =  options.appendTo
    if @appendTo
      appendToInitialize.call @

    if(@init) 
      @init(options)

  remove: ->
    app.dispatcher.off null, null, @
    @model.off null ,null ,@ if @model
    @collection.off null, null, @ if @collection
    if @_binded
      @_binded.forEach (b)=>
        b.off null, null, @
    @$el.remove()
  
  bindTo: (obj)->
    @_binded.push(obj)
    obj
  
  render: ()->
    @$el.html(@template.call(@, @))
    @trigger "render"
    @

  # merge = function(protoProps, staticProps) {
  #   var parent = this;
  #   var child;

  #   //console.log("????????????????",Object.keys(parent.prototype.infrastructure));
    
  #   if(parent.prototype.infrastructure && protoProps.infrastructure){
  #     Object.keys(parent.prototype.infrastructure).forEach(function(prop){
  #       if(!protoProps.infrastructure[prop])
  #       protoProps.infrastructure[prop] = parent.prototype.infrastructure[prop];
  #     });
  #   }

  #   // The constructor function for the new subclass is either defined by you
  #   // (the "constructor" property in your `extend` definition), or defaulted
  #   // by us to simply call the parent's constructor.
  #   if (protoProps && _.has(protoProps, 'constructor')) {
  #     child = protoProps.constructor;
  #   } else {
  #     child = function(){ return parent.apply(this, arguments); };
  #   }

  #   _.extend(child, parent, staticProps);
  #   // Add static properties to the constructor function, if supplied.


  #   // Set the prototype chain to inherit from `parent`, without calling
  #   // `parent`'s constructor function.
  #   console.log("INF", protoProps.infrastructure);
  #   var Surrogate = function(){ 
  #     this.constructor = child; 
  #   };
  #   Surrogate.prototype = parent.prototype;
  #   child.prototype = new Surrogate;
    

  #   // Add prototype properties (instance properties) to the subclass,
  #   // if supplied.
  #   if (protoProps) _.extend(child.prototype, protoProps);

  #   // Set a convenience property in case the parent's prototype is needed
  #   // later.
  #   child.__super__ = parent.prototype;

  #   return child;
  # };
