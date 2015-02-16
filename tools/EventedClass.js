
var Backbone = require("backbone");
var Class = require("./Class");

var _ = require("underscore");

var EventedClass = Class.extend("EventedClass", _.extend(Backbone.Events, {
  
  // EventedClass's constructor handles props like:
  // events:{
  //   "event_name": "method name",
  //   "evt": ["method1", "method2", function(){}],
  //   "event": function(){ ... }
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
            else if(_.isFunction(meth)){
              this.on(event, meth, this);
            }
          }
        }
      }
    }
    Class.apply(this, arguments);
  }

}), Backbone.Events);
module.exports = EventedClass;
