module.exports = function(env, cb){
  
  var _         = require("underscore"  );
  var path      = require("path"        );
  var config    = env.config;
  var bulk      = require("bulk-require");
  
  // pages, controllers, models, data

  var baseTypes = {

    log: {
      engines: ["./engines/log"]
    },

    controllers: {
      loaders: ["./loaders/controllers"]
    },

    pages: {
      engines: ["./engines/http"       ],
      loaders: ["./loaders/pages"      ]
    },

    data:{
      loaders: ["./loaders/data"       ]
    },

    models: {
      loaders: ["./loaders/models"     ]
    },

    bundles: {
      engines: ["./engines/webpack"    ],
      loaders: ["./loaders/bundles"    ]
    }
  };

  var enginesAliases = {
    "neo4j":      "./engines/neo4j",
    "elastic":    "./engines/elastic",
    "redis":      "./engines/redis",
    "mongodb":    "./engines/mongodb",
    "mysql":      "./engines/mysql",
    "postgres":   "./engines/postgres",
    "http":       "./engines/http",
    "websocket":  "./engines/websocket",
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
    "PostgresLayer":       "../lib/PostgresLayer",
    "RedisLayer":          "../lib/RedisLayer",
    "ElasticLayer":        "../lib/ElasticLayer",
    "Neo4jLayer":          "../lib/Neo4jLayer",

    "Page":                "../lib/Page",
    "Api":                 "../lib/Api",
    "Widget":              "../lib/Widget"
  };

  var loadersAliases = {
    "backbone-data-sync": "./loaders/backbone-data-sync",
    "models" :            "./loaders/models",
    "pages":              "./loaders/pages",
    "controllers":        "./loaders/controllers",
    "log":                "./loaders/log",
    "data":               "./loaders/data",
    "bundles":            "./loaders/bundles",
  };

  var classes = {};
  var engines = [];
  var loaders = [];

  env.classes = classes;

  _.each(config.structures, function(node, type){
    if(!type) return;
    if(baseTypes[type]){
      engines = engines.concat(node.engines||baseTypes[type].engines||[]).map(function(e){return enginesAliases[e]||e});
      loaders = loaders.concat(node.loaders||baseTypes[type].loaders||[]).map(function(l){return loadersAliases[l]||l});
    }
    else{
      engines = engines.concat(node.engines||[]).map(function(e){return enginesAliases[e]||e});
      loaders = loaders.concat(node.loaders||[]).map(function(l){return loadersAliases[l]||l});
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
          var result = require(classesAliases[val]?classesAliases[val]:path.join(env.config.rootDir, val));
          env.classes[key] = result;
          return result;
        }
      }));        
    }

  });

  engines = _.sortBy(_.uniq(engines), function(e){return e==="./log"?-1:1});
  loaders = _.uniq(loaders);


  console.log("loaders: ", loaders);
  console.log("engines: ", engines);
  // console.log("classes: ", classes);

  var initChain = engines.concat(loaders).map(function(c){return require(c);});

  // var bulk    = require('bulk-require');
  // var classes = bulk(path.join(__dirname, "../lib"), ['*.js']);
  // _.extend(env, classes);


  var doCache = {};
  env.i.do = function(address){
    var args    = Array.prototype.slice.call(arguments);
    var address, cb;
    if(_.isString(args[0])) address = args.shift().split(/[.\/]/);
    else                    address = args.shift();
    
    if(_.isFunction(_.last(args))) cb = _.last(args);

    var target = this[address[0]];

    if(!target) {
      return cb && cb("Can't find target: ["+address[0]+"]");
    }
    
    if(address.length === 2){
      if(target && _.isFunction(target[address[1]])){
        if(_.isArray(target.methods)){
          if(target.methods && target.methods.indexOf(address[1])!=-1){
            if(target.parseArguments) {
              args = target.parseArguments(args);
              if(args===false) return cb && cb("Invalid arguments");
            }
            target[address[1]].apply(target, args);
          }
          else return cb && cb("Invalid target: ["+address.join(".")+"]");
        }
        else{
          if(target.parseArguments) {
            args = target.parseArguments(args);
            if(args===false) return cb && cb("Invalid arguments");
          }
          target[address[1]].apply(target, args);
        }
      }
      else return cb && cb("Invalid target: ["+address.join(".")+"]");
    }
    else {
      if(!_.isFunction(target.do)) return cb && cb("Can't chain to target (missing 'do' method): ["+address.join(".")+"]");
      return target.do.apply(target, [address.slice(1)].concat(args));
    }
  };

  env.helpers.chain(initChain)(function(err){ cb(err, env); }, env );


};
