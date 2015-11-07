module.exports = function(){
  var Class2 = function(){};
  Class2.prototype = {
    method_1: function(num, cb){ cb(null, num + 10); },
    method_2: function(num, cb){ cb(null, num + 20); },
  };
  return Class2;
};

