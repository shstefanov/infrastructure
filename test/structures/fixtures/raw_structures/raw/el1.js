
module.exports = function(){};
module.exports.prototype = {
  method_1: function(num, cb){ cb(null, num * 5); },
  method_2: function(num, cb){ cb(null, num * 6); },
}