require("coffee-script");
require("colors");
var fs = require("fs");
var path = require("path");

var Suite = require("./lib/test/suite.js");
var tester = function(target, test_options){


  var testsQueue = [];
  var options = test_options || {output:"console"};

  var addFile = function(filepath){
    var suite = new Suite(filepath, options);
    require(filepath)(suite);
    testsQueue.push(suite);
  }

  var addFolder = function(folderPath){
    var files = fs.readdirSync(folderPath);
    files.forEach(function(file){
      var location = path.normalize(folderPath+"/"+file);
      initTest(location);
    });
  };

  var initTest = function(location){
    var stat = fs.statSync(location);
    if  (stat.isDirectory())   { addFolder(location); }
    else                       { addFile  (location); }
  }

  if(!fs.existsSync(target)){
    //Try for js or coffee extension
    if(fs.existsSync(target+".js")){
      addFile(target+".js");
    }
    else if(fs.existsSync(target+".coffee")){
      addFile(target+".coffee");
    }
    else{
      throw new Error("Can't find file or directory: "+target);
    }
  }
  else{
    initTest(target);
  }

  var logs = [];
  var counter = testsQueue.length;
  var ready = function(log){
    counter--;
    logs.push(log);
    if(logs.length==testsQueue.length){
      logs.forEach(function(lo){
        lo.forEach(function(l){
          console.log(l[options.output || "console"]);
        });
      });
    }
  }

  testsQueue.forEach(function(suite){
    suite.exec(function(sum, log){
      ready(log);
    });
  });
};

if(!module.parent){
    tester(process.cwd()+"/"+(process.argv[2] || "tests"));
  }
else{
  module.exports = tester;
}
