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
    if(@template)
      @$el.html(@template())
    @



