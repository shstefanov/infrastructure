
module.exports = App.Router.extend("Router", {
  
  constructor: function(){
    App.Router.apply(this, arguments);
    console.log("appending: ", this.layout);
    this.layout.append(_.values(this.views));    
  }

}, {
  build: function(approuter){
    if(!approuter) approuter = this.prototype;
    var routes = approuter.routes = approuter.routes || {};
    var views = approuter.views = {};
   
    for(key in approuter){ var View = approuter[key];
      if(key.indexOf("/") === 0){
        if(View.prototype.controller && _.has(approuter.controllers, View.prototype.controller)){
          View.prototype.controller = approuter.controllers[View.prototype.controller];
        }
        // Asuming value is view prototype
        (function(viewRoot){
          var full_root = "/"+approuter.settings.root+viewRoot;

          var view = views[full_root] = new View({ urlRoot: full_root });
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
                var full_path = (full_root+p).replace(/^\//, "");
                var subject = view;
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