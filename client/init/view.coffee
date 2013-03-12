module.exports = Backbone.View.extend

  initialize: (options)->

    opt = options || {}

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
        @compiled_template(d)

    a = opt.appendTo || @appendTo

    if(a || @appendTo == "")
      @appendTo = a
      @append = (view)=>
        if(!@__holder)
          if @appendTo == ""
            @__holder = @$el
          else
            @__holder = @$(@appendTo)
        @__holder.append(view.$el)

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



