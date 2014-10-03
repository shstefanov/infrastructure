

module.exports = function(cb){
  
  var _          = require("underscore");
  var Addresator = require("addresator");
  var CloneRPC   = require("clone-rpc" );

  var base = _.methods(this.Controller.prototype);
  this.createController = function(name, Controller){
    
    var pr = Controller.prototype;
    _.extend(pr, {name: name, methods: _.difference(_.methods(pr), base)});
    pr.private?_.extend(pr, pr.private):null;
    delete pr.private;

    return new Controller();
  };

  if(this.skipLoading === true) return cb&&cb();

  var env    = this;
  var path   = require("path");
  var fs     = require("fs");
  var config = env.config;

  if(!config.controllers || !fs.existsSync(path.join(config.rootDir, config.controllers))) return cb();
  
  var controllersPath = path.join(config.rootDir, config.controllers);
  
  if(fs.existsSync(path.join(config.rootDir, config.controllers, "init.js"))){
    var initializer = require(path.join(config.rootDir, config.controllers, "init.js"));
    initializer.call(env, go);
  }
  else go();

  function go(err){
    if(err) return cb&&cb(err);

    var controllersDir  = path.join(config.rootDir, config.controllers);
    var controllerFiles = fs.readdirSync(controllersDir);

    env.controllers = {};

    controllerFiles.forEach(function(filename){
      if(filename === "init.js") return;
      var name = filename.replace(/\.js$/, "");
      var module = require(path.join(controllersDir, filename));
      var Prototype = module.apply(env);
      name = Prototype.prototype.name||name;
      env.controllers[name] = env.createController(name, Prototype);
      env.sys("controller", "Built:              "+name);
    });

    var getMethods = function(controllers){
      var result = {};
      for(var i = 0;i<controllers.length;i++) result[controllers[i].name] = controllers[i].methods;
      return result;
    }

    var getter;
    var ControllerFactory = new CloneRPC({
      getData:  function(){},
      sendData: function(data){ env.node.layers.controller.send([env.config.serverAddress, "pigeonry"], data); },
      onClone: function(){}
    });

    env.node.layer("controller", function(data){ ControllerFactory.onMessage(data); });
    
    env.node.layers.controller.send(["core", "pigeonry"], {initialize: true}, function(){
      ControllerFactory.build(env.address, {}, function(){
        for(var name in env.controllers){
          (function(name){
            var controller = env.controllers[name];
            ControllerFactory.clone(function(controller_clone){
              controller_clone.setOptions({context: controller});
              var availableMethods = controller.methods.concat(["on", "once", "off", "addSubject", "removeSubject", "handleMessage"]);
              var controllerData = _.pick(controller, availableMethods);
              controllerData.listeners = ["on"];
              controllerData.availableMethods = availableMethods;
              controller_clone.build({
                name: name,
                methods: controller.methods
              }, controllerData, function(){
                
              });
            });
            
          })(name)
        }


        cb&&cb(null);
      });
    });


    //cb&&cb();
  }

}
