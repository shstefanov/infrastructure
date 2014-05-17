
// Template can be regular template or object of type:
// {
//   "buttonClassNameAndNameOfMethodThatWillBeCalled": "Button text|Button title"
// }


var renderCached = function(){
  this.$el.empty()
  var content = ""
  if(this._cachedFunctions.length)
    this._cachedFunctions.forEach(function(fn){content+=fn()})
  this.$el.html(this._cachedContent+content);
  console.log("render controls", this._cachedContent+content)
  return this;
}

module.exports = App.AdvancedView.extend("Controls", {
  className: "controls",
  initialize: function(options){
    if(options){
      this.template = options.template || this.template
      options.style && this.$el.css(options.style)
    }
    
  },
  
}, {

  infrastructureName: "controls",
  infrastructure: function(view, options){
    var controls = new this(options);
    if(options.template) controls.template = options.template;

    if(_.isObject(options.template || controls.template)){
      controls._cachedContent = ""
      controls._cachedFunctions = []
      var events = {}
      for(key in controls.template){
        if(typeof controls.template[key] == "function"){
          controls._cachedFunctions.push(_.bind(controls.template[key], view, view))
          continue;
        }
        
        (function(){
          var className = key
          var methodName = key
          var parts = controls.template[key].split("|")
          var text = parts[0].trim()
          var title = parts.length>1?(" title=\""+parts[1].trim()+"\""): ""
          var col = "";
          if(typeof view[methodName] != "function") {
            col = " style='color:red !important'"
          }else{
            controls[methodName] = function(e){this.subject[methodName](e)}
            events["click ."+key] = className;
          }
          controls._cachedContent+="<a"+col+title+" href='javascript:void(0)' class='control "+className+"'>"+text+"</a>"
        }())
      }
      controls.render = renderCached
      var combinedEvents = _.extend({}, controls.events || {}, events)
      controls.delegateEvents(events)
    }

    controls.subject = view
    view.infrastructure.controls = controls;
    if(view.appendTo){
      view.on("render", function(){view.append(controls)})
    }
    else{
      view.on("render", function(){view.$el.append(controls.render().$el)})
    }
    if(options.events) controls.delegate(view, oprions.events);
    view.trigger("render");
  }

});