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
    @

# ,

#   extend: (attrs, classMethods)->
#     return 
#     # new_attrs = {infrastructure:@prototype.infrastructure || {}}
#     # new_attrs[key] = value for key, value of @prototype
#     # new_attrs.infrastructure[key] = value for key, value of @prototype.infrastructure if @prototype.infrastructure
#     # new_attrs.infrastructure[key] = value for key, value of attrs.infrastructure if attrs.infrastructure
#     # if @prototype.events
#     #   new_attrs.events = {} if !new_attrs.events
#     #   for key, value of @prototype.events 
#     #     new_attrs.events[key] = value 
#     # if attrs.events
#     #   new_attrs.events = {} if !new_attrs.events
#     #   for key, value of attrs.events 
#     #     new_attrs.events[key] = value 
#     # console.log "sur----->", @prototype
#     # console.log "new----->", new_attrs
#     result = Backbone.View.extend.call(@, new_attrs, classMethods)
#     # console.log "result------>", result.prototype
#     return result




