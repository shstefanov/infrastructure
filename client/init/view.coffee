
window.View = Backbone.View.extend

  initialize: (options)->
    compiled_template = jade.compile(@template)
    @template = =>
      compiled_template({view:@, t: $.t})

    if(@init) 
      @init(options)

    dispatcher.on "translation", =>
      @render()

  update: ->
    @


