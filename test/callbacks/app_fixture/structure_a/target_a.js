

var TargetA = function(env){

};

TargetA.prototype.handle_callback = function(data, cb){
  cb(null, data); // send back data
  cb(null, data); // never recieved
  cb(null, data); // never recieved
}

TargetA.prototype.handle_listener = function(data, listener){
  var count = 4;
  var i = setInterval(function(){
    count--;
    if(count === 0) return clearInterval(i);
    listener(count, data);
  }, 100 );
}

TargetA.prototype.handle_drop_listener_targetside = function(data, listener){

}


module.exports = TargetA;