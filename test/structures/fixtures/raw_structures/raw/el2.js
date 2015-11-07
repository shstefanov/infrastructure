
module.exports = function(){};
module.exports.prototype = {
  method_1: function(num, cb){ cb(null, num + 10); },
  method_2: function(num, cb){ cb(null, num + 20); },
}
