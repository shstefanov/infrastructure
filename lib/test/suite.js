var spaces = "                                                                   ";
var level_step = 2;

var tags = function(string, level, color){
  return "<p style = 'padding-left:"+level+"em;background-color:black;color:"+color+"'>"+string+"</p>"
};

var for_console = function(string, level, color){
  return spaces.slice(0,level)+string[color];
}

format_message = function(message, level, color, options){

  var result =  {
    message:message,
    color: color, 
    level: level
  };
  if(options.html){
    result.html = tags(message, level, color);
  }
  else if(options.console){
    result.console = for_console(message, level, color);
  }
  else{
    result.html = tags(message, level, color);
    result.console = for_console(message, level, color);
  }
  return result;
}
var report = function(message, errors, passed, level, options){

  var error_report_color = errors>0? "red":"green";

  var result = {
    message:message,
    color: null, //Various colors
    level: level
  };

  var return_html = function(){
    //Html output
    var test_html_report = tags("[/ "+message+"]", level, "yellow");
    var errors_html_report = tags("[errors:"+errors+"]", 0, error_report_color);
    var success_html_report = tags("[success:"+passed+"]", 0, "green");
    return test_html_report + errors_html_report + success_html_report;
  }

  var return_console = function(){
    //Console output
    var test_console_report = for_console(message, level, "yellow");
    var errors_console_report = for_console("[errors:"+errors+"]", 0, error_report_color);
    var success_console_report = for_console("[success:"+passed+"]", 0, "green");
    var res = test_console_report + errors_console_report + success_console_report;
    return res;
  }

  if(options.html){
    result.html = return_html();
  }

  else if(options.console){
    result.console = return_console();
  }

  else{
    result.html = return_html();
    result.console = return_console();
  }
  return result;
}

// var options = {
//   console:true|false
//   html:true|false
//   levelStep: int
//   timeout:int
// }
var Suite = function(filename, options){
  
  this.filename = filename;
  this.options = options || {};
  var self = this;
  var level1 = 0;
  var level2 = 2;
  var level3 = 4;
  var testQueue = [];
  
  var errors = 0;
  var messages = [];
  
  var passed = 0;
  var index = -1;
  var test_message_buffer = [];

  var onReadyCallback;

  this.description = function(description){
    this.desc  = description;
  };

  this.options = function(options){
    for(key in options){
      this.options[key] = opions[key];
    }
  };
  
  this.exec = function(cb){
    onReadyCallback = cb;
    messages.push(format_message("["+(this.desc || this.filename)+"]", level1, "yellow", this.options));
    if(testQueue.length>0){
      this.next();
    }
  };

  var ready = function(){
    messages.push(report("["+(self.desc || this.filename)+"]", errors, passed, level1, self.options));
    self.log = messages;
    self.summary = { errors:errors, passed:passed, all:errors+passed };
    onReadyCallback(self.summary, self.log);
  };

  this.next = function(){
    index++;
    if(!testQueue[index]){ ready(); }
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
        self.next();
      }

      setTimeout(function(){
        if(!ok){
          timeout = true;
          var m =  testQueue[index].test_case+": timeout "+((options.timeout+" ms") || ("(default"+5000+"ms)"));
          var msg = format_message(m, level2, "red", self.options);
          messages[current_index] = msg;
          go();
        }
      }, options.timeout || 5000);

      testQueue[index].callback(function(){
        ok = true;
        if(!timeout){
          var msg = format_message(testQueue[index].test_case, level2, "blue", self.options);
          messages[current_index] = msg;
          go();
        }
      });
      
    }
  };

  this.Xabout = function(){};
  this.Xtest = this.Xabout;

  this.about = function(t_case, cb){
    testQueue.push({ test_case: t_case, callback:cb });
    return self;
  }
  
  this.test = function(test_name, val1, val2){
    if(val1 !== val2){
      errors++;
      //(message, level, color, name, test, about)
      var msg = "Error: "+test_name+" -> expected "+val1+" to be "+val2;
      var msg_object = format_message(msg, level3, "red", this.options);
      test_message_buffer.push(msg_object);
    }
    else{
      passed++;
      var msg = "Passed: "+test_name;
      var msg_object = format_message(msg, level3, "green", this.options);
      test_message_buffer.push(msg_object);
    }
    return self;
  };

}

module.exports = Suite;

