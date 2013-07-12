
var yellow = function(string){
  if(typeof window === "undefined")
    return string.yellow;
  else
    return("<p style = 'background-color:black;color:yellow'>"+string+"</p>");
}

var yellow_main = function(string){
  if(typeof window === "undefined")
    return "\n\n"+string.yellow;
  else
    return("<p style = 'background-color:black;color:yellow'>"+string+"</p>");
}

var blue = function(string){
  if(typeof window === "undefined")
    return string.blue;
  else
    return("<p style = 'background-color:black;color:blue'>"+string+"</p>");
}

var blue_about = function(string){
  if(typeof window === "undefined")
    return ("\n\t"+string).blue;
  else
    return("<p style = 'padding-left:4em;background-color:black;color:blue'>"+string+"</p>");
}

var red_about = function(string){
  if(typeof window === "undefined")
    return ("\n\t"+string).red;
  else
    return("<p style = 'padding-left:4em;background-color:black;color:red'>"+string+"</p>");
}

var red_test = function(string){
  if(typeof window === "undefined")
    return ("\t\t"+string.red);
  else
    return("<p style = 'padding-left:6em;background-color:black;color:red'>"+string+"</p>");
}

var red = function(string){
  if(typeof window === "undefined")
    return string.red;
  else
    return("<p style = 'background-color:black;color:red'>"+string+"</p>");
}

var green_test = function(string){
  if(typeof window === "undefined")
    return "\t\t"+string.green;
  else
    return("<p style = 'padding-left:6em;background-color:black;color:green'>"+string+"</p>");
}
var green = function(string){
  if(typeof window === "undefined")
    return string.green;
  else
    return("<p style = 'background-color:black;color:green'>"+string+"</p>");
}


var Suite = function(suite_name, opts){
  
  this.name = suite_name;
  var options = opts || {};
  var self = this;
  var testQueue = [];
  var errors = 0;
  var messages = [];
  var passed = 0;
  var index = -1;
  var test_message_buffer = [];
  var onReadyCallback;
  
  this.run = function(cb){
    onReadyCallback = cb;
    messages.push(yellow_main("["+suite_name+"]"));
    this.next();
  };

  var ready = function(){
    if(errors > 0)
      var errorLog = red("........[errors:"+errors+"]");
    else
      var errorLog = green("........[errors:"+errors+"]");

    var passLog = green("[passed:"+passed+"]");
    messages.push(yellow_main("[/ "+suite_name+"]")+errorLog+passLog);
    self.log = messages;
    if(options.silent != true)
      messages.forEach(function(m){console.log(m);});
    if(typeof onReadyCallback == "function")
      onReadyCallback();
  };

  this.next = function(){
    
    var prev_args = arguments;
    index++;
    if(!testQueue[index]){ready();}
    else{
      var timeout = false;
      var ok = false;
      messages.push("current_message");
      var current_index = messages.length-1;

      function go(){
        var m, _i, _len = test_message_buffer.length;
        for (_i = 0, _len ; _i < _len; _i++) {
          m = test_message_buffer[_i];
          messages.push(m);
        }
        test_message_buffer = [];
        self.next(prev_args);
      }

      setTimeout(function(){
        if(!ok){
          timeout = true;
          messages[current_index] = (red_about(testQueue[index].test_case+ ": timeout "+options.timeout || ("(default"+5000+")")));
          go();
        }
      }, options.timeout || 5000);

      testQueue[index].callback(function(){
        ok = true;
        if(!timeout){
          messages[current_index] = blue_about(testQueue[index].test_case);
          go();
        }
      });
      
    }
  };

  this.Xabout = function(){};
  this.Xtest = this.Xabout;

  this.about = function(t_case, cb){
    testQueue.push({
      test_case: t_case,
      callback:cb
    });
    return self;
  }
  
  this.test = function(test_name, val1, val2){
    if(val1 !== val2){
      errors++;
      errmsg = "expected "+val1+" to be "+val2;
      test_message_buffer.push(red_test("Error: "+test_name+" -> "+errmsg));
    }
    else{
      passed++;
      test_message_buffer.push(green_test("Passed: "+test_name));
    }
    return self;
  };

}

module.exports = Suite;

