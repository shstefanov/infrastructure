var Class = function(){};
Class.prototype = {
  method_1: function(num, cb){ cb(null, num + 10); },
  method_2: function(num, cb){ cb(null, num + 20); },
};

Class.extend = function(){ return Class; };

module.exports =  Class; 