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

renderView = (view_name, locals, passedData)->
  return '' if view_name == null
  return "No template - "+view_name if !App.Views[view_name]
  prototype = App.Views[view_name]

  if renderedData[view_name]
    data = renderedData[view_name] || locals[view_name] || passedData
    data_type = null
    toAppend = null
    if typeof data == "object"
      data_type = "model"
      if App.Models[view_name]
        toAppend = new App.Models[view_name](data)
      else
        toAppend = new App.Model(data)
    else if Array.isArray(data)
      data_type = "collection"
      if App.Collections[view_name]
        toAppend = new App.Collections[view_name]()
      else
        toAppend = new App.Collection()
      toAppend.reset(data)
    else
      data_type = null

    if data_type
      locals[data_type] = toAppend
    if !prototype.prototype.__wrapper
      prototype.prototype.__wrapper = jade.compile getWrapper(prototype)

    wrapper = prototype.prototype.__wrapper()
    all = wrapper.replace('><', ">"+prototype.prototype.template(locals)+"<")
    return all




module.exports = Backbone.View.extend
  local: {}
  initialize: (options)->
    @model = options.model if options and options.model
    @collection = options.collection if options and options.collection
    
    if @model and @model.on
      @model.on "change" ,@render ,@
      @model.on "destroy remove" ,@remove ,@
    if @collection and @collection.on
      @collection.on "reset remove add", @render, @
    
    if(options and options.template)
      tmpl = options.template 
    else if @template 
      tmpl = @template
    else
      tmpl = undefined
    if typeof tmpl == "string"
      @compiled_template = jade.compile(tmpl)
    else if typeof tmpl == "function"
      @compiled_template = tmpl
    
    if tmpl
      @template = ()=>
        d = {t:i18n.t}
        d.model = @model if @model
        d.collection = @collection if @collection
        d.config = config
        d.local = @local
        d.locals = d
        d.renderView = renderView
        d.lng = i18n.lng()
        d.utils = app.utils

        #To do
        d.views = App.Views
        d.layout = undefined
        d.target = undefined

        html = @compiled_template(d)
        html
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
    if window._renderedData
      if @match
        @match(window._renderedData)
        delete window._renderedData
      return @
    if(@template)
      @$el.html(@template())
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




