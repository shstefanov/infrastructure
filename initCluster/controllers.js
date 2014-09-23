

module.exports = function(cb){
  
  var _ = require("underscore");
  var Addresator = require("addresator");
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
    env.controllers = env._.dirToObject(controllersPath, function(name, folderName, module){
      if(name === "init") return;
      var Prototype = module.apply(env);
      var name = Prototype.prototype.name||name;
      var controller = env.createController(name, Prototype);
      controller.addresator = new Addresator({
        id: name,
        onMessage: function(data, cb, remote_addr){
          (controller[data.method] && typeof controller[data.method] === "function")? controller[data.method](data.body, data.subject, cb) : (console.error("Wrong data") && console.log(rguments));
        }
      })
      controller.addresator.branch(env.node.id, function(addr, data, cb){
        env.node.route(addr, data, cb);
      })
      env.node.branch(name, function(addr, data, cb){
        controller.addresator.route(addr, data, cb);
      })
      return controller;
    });




    var getMethods = function(controllers){
      var result = {};
      for(var i = 0;i<controllers.length;i++) result[controllers[i].name] = controllers[i].methods;
      return result;
    }

    env.node.onMessage = function(data, cb, remote_addr){
      switch(data.type){
        case "getControllers":
          var controllers = _.map(data.body, function(controllerName){
            return _.pick(env.controllers[controllerName], ["name", "methods"]);
          });
          cb(null, getMethods(controllers));
          break;



        default:
          break;
      }
    },


    cb&&cb();
  }

}
