var disableselection = function(){
  $("body").css({
   '-moz-user-select':'none',
   '-webkit-user-select':'none',
   'user-select':'none',
   '-ms-user-select':'none'})
  .attr('unselectable', 'on')
  .onselectstart = function(){return false;};
};
var enableselection = function(){
   $("body").css({
     '-moz-user-select':'auto',
     '-webkit-user-select':'auto',
     'user-select':'auto',
     '-ms-user-select':'auto'
    })
    .attr('unselectable', 'off')
    .onselectstart = function(){};
};

var cancel = function(){$("body").off("mousemove")};
$("body").on("mouseup", cancel).on("mousedown", cancel);


module.exports = App.AdvancedView.extend({
  window_template: require("./window.jade"),
  className: "window",
  appendTo: ".content",
  
  initialize: function(options){
    if(options.style) this.$el.css(options.style);
    $(".window-bar").append(this.$el);
    this.toDetach = []
  },

  externalElement: function(view){
    this.toDetach.push(view)
    this.append(view)
  },

  render: function(){
    _.invoke(_.pluck(this.toDetach, "$el"), "detach")
    this.$el.html(this.window_template(this.subject || this));
    this.template && this.$(this.appendTo).html(this.template(this));
    this.append(this.toDetach)
    return this;
  },

  events:{
    "mousedown .titlebar": "startDrag",
    "mouseup": "stopDrag",
    "click .closeBtn": "close",
    "click .minimizeBtn": "minimize",
    "mousedown .resize": "startResize",
    "mouseup": "stopResize"
  },

  resizing: function(event){
    var delta = this.getDelta(event);
    var movex = this.resizeDirection.x == -1? delta.x*this.resizeDirection.x : 0;
    var movey = this.resizeDirection.y == -1? delta.y*this.resizeDirection.y : 0;
    var newVal = {
      width: (this.startResizeState.x - delta.x*this.resizeDirection.x),
      height: (this.startResizeState.y - delta.y*this.resizeDirection.y),
      left: this.window_startpos.x + movex,
      top: this.window_startpos.y + movey
    };
    this.$el.css(newVal);
    this.trigger("resize", this.getAvailableArea(newVal));

  },

  availableArea:{
    x: 0,
    y:-48
  },

  getAvailableArea: function(val){
    return {
      width: (val? val.width : this.$el.width() ) + this.availableArea.x,
      height: (val? val.height : this.$el.height() ) + this.availableArea.y,
    }
  },

  stopResize: function(){
    enableselection();
    cancel();
  },

  startResize: function(event){
    disableselection();
    var resizeData = $(event.currentTarget).attr("data-resize").split(",").map(function(n){return parseInt(n)});
    this.resizeDirection = {
      x: resizeData[0],
      y: resizeData[1]
    }
    this.shouldResize = {
      x: this.resizeDirection.x*this.resizeDirection.x,
      y: this.resizeDirection.y*this.resizeDirection.y,
    };
    var offset = this.$el.offset();
    this.window_startpos = {
      x: offset.left,
      y: offset.top
    };

    this.startResizeState = {
      x: this.$el.width(),
      y: this.$el.height(),
    };
    this.setStartPos(event);
    var self = this;
    $("body").on("mousemove", function(e){
      self.resizing(e);
    });
  },


  minimize: function(){
    this.$el.toggleClass("minimized");
  },

  close: function(){
    this.remove().trigger("close");
    return this;
  },

  stopDrag: function(){
    this.dragging = false;
    enableselection();
    cancel();
  },

  move: function(event){
    if(!this.dragging) return;
    var delta = this.getDelta(event);

    var newPos = {
      x: this.window_startpos.x - delta.x,
      y: this.window_startpos.y - delta.y
    };
    this.$el.css({top: newPos.y, left: newPos.x});
  },

  getDelta: function(event){
    return {
      x: this.startpos.x - event.pageX,
      y: this.startpos.y - event.pageY
    };
  },

  setStartPos: function(event){
    this.startpos = {
      x: event.pageX,
      y: event.pageY
    };
  },

  startDrag: function(event){
    if(this.$el.hasClass("minimized")){
      this.$el.toggleClass("minimized");
      return;
    }
    this.dragging = true;
    disableselection();
    this.setStartPos(event);
    var offset = this.$el.offset();
    this.window_startpos = {
      x: offset.left,
      y: offset.top
    };

    var self = this;
    $("body").on("mousemove", function(event){ self.move(event); });
  }
}, { // Infrastructure properties

  infrastructureName: "window",
  infrastructure: function(view, options){
    // new instance
    var win = new this(options)//.render();
    
    // share references
    win.subject = view;
    view.infrastructure.win = win;

    // switch render method
    view._render = view.render;
    view.render = wrappedRender;

    // append view to win
    win.$(win.appendTo).append(view.$el);
    
    win.on("resize", view.$el.css, view.$el)
    view.resize && win.on("resize", view.resize, view)
    win.trigger("resize", win.getAvailableArea())
    options.events && win.delegate(view, options.events);
    
  }


})

var wrappedRender = function(){
  var win = this.infrastructure.win;
  this.$el.detach();
  win.render().$(win.appendTo).append(this._render().$el);
  return this;
}