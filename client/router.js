
module.exports = App.Router.extend("AdvancedRouter", {
  
  constructor: function(){
    App.Router.apply(this, arguments);
    this.layout.append(_.invoke(_.values(this.views), "render"));
  }

}, {
  build: function(approuter){
    if(!approuter) approuter = this.prototype;
    var routes = approuter.routes = approuter.routes || {};
    var views = approuter.views = {};
   
    for(key in approuter){ var View = approuter[key];
      
      if(key.indexOf("/") === 0){
        if(key==="/") key="";
        (function(viewRoot){
          var controller;

          var full_root = approuter.config.root+viewRoot;//
          var view = views[full_root] = new View({ urlRoot: full_root });//
          view.hide?view.hide():view.$el.hide();//
          

          function switchView(view){
            for(key in approuter.views){
              approuter.views[key].hide && approuter.views[key].hide();
            }
            view.show && view.show();
            return view;
          }

          
          for(prop in view){
            if(prop.indexOf("/") === 0 || prop === ""){
              (function(path){
                var p = path;
                if(path==="/") p = "";
                var full_path = (full_root+p);
                full_path = full_path.replace(/^\//, "");
                approuter.routes[full_path] = full_path;
                approuter[full_path] = function(){ switchView(view)[path].apply(view, arguments) }
              }(prop))
            }
          }

        }(key));

      }
    }
  }
});