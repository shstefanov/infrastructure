module.exports = Backbone.View.extend
  local: {}
  initialize: (options)->



    if @model instanceof Backbone.View
      @model.on "change" ,@render ,@
      @model.on "destroy remove" ,@remove ,@
    if @collection instanceof Backbone.Collection
      @collection.on "reset remove add", @render, @

    if(options and options.template)
      tmpl = options.template 
    if @template 
      tmpl = @template
    if tmpl
      @compiled_template = jade.compile(tmpl)
      @template = ()=>
        d = {t:i18n.t}
        d.model = @model if @model
        d.collection = @collection if @collection
        d.config = config
        d.local = @local
        html = @compiled_template(d)
        html
    
    if(options && (options.appendTo || @appendTo))
      @appendTo = options.appendTo || @appendTo
    
      @empty = =>
        if @appendTo == "."
          @$el.empty()
        else
          @$(@appendTo).empty()

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

       
    if(@init) 
      @init(options)


    app.dispatcher.on "translation", @render, @

  remove: ->
    app.dispatcher.off null, null, @
    @model.off null ,null ,@ if @model
    @collection.off null, null, @ if @collection
    if @_binded
      @_binded.forEach (b)=>
        b.off null, null, @
    Backbone.View.prototype.remove.apply(@, arguments)

  bindTo: (obj)->
    @_binded.push(obj)
    obj

  render: ()->
    if(@template)
      @$el.html(@template())
    @



