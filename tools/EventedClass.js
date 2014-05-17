
var Backbone = require("backbone");
var Class = require("./Class");

var _ = require("underscore");

var EventedClass = Class.extend("EventedClass", _.extend(Backbone.Events, {
  
  // EventedClass's constructor handles props like:
  // events:{
  //   "event_name": "method name",
  //   "evt": ["method1", "method2"],
  //   "event": function(){ ... }
  //   "evt_name": {
  //     "method_name": function(args){ return some_modifier(args); },
  //     "other_method": function(args){ return other_modifier(args); }
  //   }
  // }

  constructor: function(){
    if(_.isObject(this.events)){
      for(event in this.events){ var evt = this.events[event];
        
        if(_.isFunction(evt)) this.on(event, evt, this);
        
        else if(_.isString(evt) && _.isFunction(this[evt])){
          this.on(event, this[evt], this);
        }
        
        else if(_.isArray(evt)){
          for(var i = 0;i< evt.length;i++){ var meth = evt[i];
            if(_.isString(meth) && _.isFunction(this[meth])){
              this.on(event, this[meth], this);
            }
          }
        }
        
        else if(_.isObject(evt)){
          var self = this;
          for(meth in evt){
            if(_.isFunction(this[meth]) && _.isFunction(evt[key])){
              this.on(event, _.compose(self[meth], evt[meth]), this);
            }
          }
        }
        
      }
    }
    Class.apply(this, arguments);
  }

}), Backbone.Events);
module.exports = EventedClass;
