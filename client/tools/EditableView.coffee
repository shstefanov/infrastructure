module.exports = App.View.extend
  
  events:
    "click .editable-field": "edit"
    "click .saveBtn" : "save"
    "click .removeBtn": "destroy"

  init: (options)->
    @model.on("change", @render, @)
    @model.on("error", =>
      console.log("editable view model error", arguments)
    , @)
    @model.on("destroy", @remove, @)
    @model.on "save", =>
      @$el.addClass("saved")
      @$el.removeClass("not-saved")
    ,@

  edit: (e)->
    td = $(e.currentTarget)
    input = $("<input type=text>")
    td.empty().append(input)
    attrName = td.attr("model-data")
    input.val(@model.get(attrName))
    input.blur =>
      @model.set(attrName, input.val(),{silent:true})
      td.html(@model.get(attrName))
      
    input.focus().keydown (event)=>
      if(event.keyCode == 13)
        @model.set(attrName, input.val(),{silent:true})
        td.html(@model.get(attrName))
        return
      @model.set(attrName, input.val(), {silent:true})
      @$el.removeClass("saved")
      @$el.addClass("not-saved")
  
  save: ->
    @model.save()
  
  destroy:->
    @model.destroy()
