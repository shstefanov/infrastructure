

var TargetA = function(env){

};

TargetA.prototype.echo_1000 = function(data, cb){
  setTimeout(function(){
    cb(null, data);
  }, 1000);
}

module.exports = TargetA;