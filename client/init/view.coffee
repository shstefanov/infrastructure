module.exports = Backbone.View.extend

  initialize: (options)->

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
    @$el.empty()
    if(@template)
      @$el.html(@template())
    @



