module.exports = function(env, cb){
  
  var _         = require("underscore"  );
  var path      = require("path"        );
  var config    = env.config;
  var bulk      = require("bulk-require");
  
  // pages, controllers, models, data

  var baseTypes = {

    log: {
      loaders: ["./log"]
    },

    controllers: {
      loaders: ["./models", "./controllers"]
    },

    pages: {
      engines: ["http"     ],
      loaders: ["./pages"  ]
    },

    data:{
      loaders: ["./data"   ]
    },

    models: {
      loaders: ["./models" ]
    },

    bundles: {
      engines: ["webpack"  ],
      loaders: ["./bundles"]
    }
  };

  var enginesAliases = {
    "mongodb":    "./mongodb",
    "mysql":      "./mysql",
    "postgres":   "./postgres",
    "http":       "./http",
    "websocket":  "./websocket",
  };

  var classesAliases = {

    "Class":               "../lib/Class",
    "EventedClass":        "../lib/EventedClass",

    "Controller":          "../lib/Controller",

    "Model":               "../lib/Model",
    "Collection":          "../lib/Collection",
    "ExtendedModel":       "../lib/ExtendedModel",
    "ExtendedCollection":  "../lib/ExtendedCollection",

    "SocketsCollection":   "../lib/SocketsCollection",

    "DataLayer":           "../lib/DataLayer",
    "MysqlLayer":          "../lib/MysqlLayer",
    "MongoLayer":          "../lib/MongoLayer",

    "Page":                "../lib/Page",
    "Api":                 "../lib/Api",
    "Widget":              "../lib/Widget"
  };

  var loadersAliases = {
    "models" :     "./models",
    "pages":       "./pages",
    "consrollers": "./controllers",
    "log":         "./log",
    "data":        "./data",
    "bundles":     "./bundles",
  }

  var classes = {};
  var engines = [];
  var loaders = [];

  env.classes = classes;

  _.each(config.structures, function(node, type){
    if(!type) return;
    if(baseTypes[type]){
      engines = _.unique(engines.concat(node.engines||[]).concat(baseTypes[type].engines || []));
      loaders = _.unique(loaders.concat(node.loaders||[]).concat(baseTypes[type].loaders || []));
    }
    else{
      engines = _.unique(engines.concat(node.engines||[]));
      loaders = _.unique(loaders.concat(node.loaders||[]));
    }

    if(node.libs){
      _.extend(classes, _.mapObject(node.libs || {}, function(val, key){
        if(Array.isArray(val)) {
          val = val.slice();
          val[0] = path.join(process.cwd(), val[0]);
          var result = bulk(val[0], val[1]);
          if(val[2]===true) env.helpers.objectWalk(result, function(nodeName, target, parent){
            parent[nodeName] = env.getCached(target);
          });
          env.classes[key] = result;
          return result;
        }
        else {
          var result = require(classesAliases[val]?classesAliases[val]:val);
          env.classes[key] = result;
          return result;
        }
      }));        
    }

  });

  engines = engines.map(function(e){ return enginesAliases[e] || e; });
  loaders = loaders.map(function(e){ return loadersAliases[e] || e; });




  console.log("loaders: ", loaders);
  console.log("engines: ", engines);
  console.log("classes: ", classes);


  

  var initChain = [
    
    // require("./log"          ),
    // // require("./websocket"    ),
    // // // require("./bundles"      ),
    // require("./mongodb"      ),
    // require("./mysql"        ),
    // require("./postgres"     ),
    // require("./http"         ),
    
    // require("./data"         ),
    // require("./models"       ),
    // require("./pages"        ),
    // require("./controllers"  )

  ];

  var bulk    = require('bulk-require');
  var classes = bulk(path.join(__dirname, "../lib"), ['*.js']);
  _.extend(env, classes);


  var doCache = {};
  env.i.do = function(address, args, cb){
    if(_.isString(address)) {
      var args    = Array.prototype.slice.call(arguments);
      var address = args.shift();
      var last    = _.last(args);
      if(_.isFunction(last)) cb = last;
      address = address.split(".");
    }
    if(!this[address[0]]) {
      return cb && cb("Can't find target: ["+address[0]+"]");
    }
    
    if(address.length === 2){
      if(this[address[0]] && _.isFunction(this[address[0]][address[1]])){
        if(_.isArray(this[address[0]].methods)){
          if(this[address[0]].methods && this[address[0]].methods.indexOf(address[1])!=-1){
            this[address[0]][address[1]].apply(this[address[0]], args);
          }
          else return cb && cb("Invalid target: ["+address.join(".")+"]");
        }
        else{
          this[address[0]][address[1]].apply(this[address[0]], args);
        }
      }
      else return cb && cb("Invalid target: ["+address.join(".")+"]");
    }
    else {
      if(!_.isFunction(this[address[0]].do)) return cb && cb("Can't chain to target (missing 'do' method): ["+address.join(".")+"]");
      return this[address[0]].do(address.slice(1), args);
    }
  };

  env.helpers.chain(initChain)(function(err){ cb(err, env); }, env );


};
