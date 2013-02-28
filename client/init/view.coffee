module.exports = Backbone.View.extend

  initialize: (options)->
    @_binded = []
    compiled_template = jade.compile(@template)
    @template = =>
      compiled_template({view:@, t: $.t})

    if(@init) 
      @init(options)

    app.dispatcher.on "translation", @render, @

  remove: ->
    app.dispatcher.off null, null, @
    @model.off null ,null ,@
    @collection.off null, null, @
    @_binded.forEach (b)=>
      b.off null, null, @

  bindTo: (obj)->
    @_binded.push(obj)
    obj



