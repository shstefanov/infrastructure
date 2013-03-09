module.exports = Backbone.View.extend

  initialize: (options)->
    @_binded = []
    compiled_template = jade.compile(@template)
    @template = ()=>
      d = {}
      d.t = $.t
      d.model = @model
      d.collection = @collection
      compiled_template(d)

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

  render: (data)->
    @$el.html(@template(data))
    @



