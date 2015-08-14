module.exports = function(env, cb){
  
  var _         = require("underscore"  );
  var path      = require("path"        );
  var config    = env.config;
  var bulk      = require("bulk-require");
 
  var enginesAliases = {
    "log":        path.join( __dirname, "../engines/log.js"        ),
    "neo4j":      path.join( __dirname, "../engines/neo4j.js"      ),
    "elastic":    path.join( __dirname, "../engines/elastic.js"    ),
    "redis":      path.join( __dirname, "../engines/redis.js"      ),
    "mongodb":    path.join( __dirname, "../engines/mongodb.js"    ),
    "mysql":      path.join( __dirname, "../engines/mysql.js"      ),
    "postgres":   path.join( __dirname, "../engines/postgres.js"   ),
    "http":       path.join( __dirname, "../engines/http.js"       ),
    "websocket":  path.join( __dirname, "../engines/websocket.js"  ),
    "webpack":    path.join( __dirname, "../engines/webpack.js"    ),
  };

  var libsAliases = {

    "Class":               path.join( __dirname, "../../lib/Class"                     ),
    "EventedClass":        path.join( __dirname, "../../lib/EventedClass"              ),

    "Controller":          path.join( __dirname, "../../lib/Controller"                ),

    "Model":               path.join( __dirname, "../../lib/Model"                     ),
    "Collection":          path.join( __dirname, "../../lib/Collection"                ),
    "ExtendedModel":       path.join( __dirname, "../../lib/ExtendedModel"             ),
    "ExtendedCollection":  path.join( __dirname, "../../lib/ExtendedCollection"        ),

    "SocketsCollection":   path.join( __dirname, "../../lib/SocketsCollection"         ),

    "DataLayer":           path.join( __dirname, "../../lib/DataLayers/DataLayer"      ),
    "MysqlLayer":          path.join( __dirname, "../../lib/DataLayers/MysqlLayer"     ),
    "MongoLayer":          path.join( __dirname, "../../lib/DataLayers/MongoLayer"     ),
    "PostgresLayer":       path.join( __dirname, "../../lib/DataLayers/PostgresLayer"  ),
    "RedisLayer":          path.join( __dirname, "../../lib/DataLayers/RedisLayer"     ),
    "ElasticLayer":        path.join( __dirname, "../../lib/DataLayers/ElasticLayer"   ),
    "Neo4jLayer":          path.join( __dirname, "../../lib/DataLayers/Neo4jLayer"     ),

    "Page":                path.join( __dirname, "../../lib/Page"                      ),
    "Api":                 path.join( __dirname, "../../lib/Api"                       ),
    "Widget":              path.join( __dirname, "../../lib/Widget"                    ),

    "WebsocketApp":        path.join( __dirname, "../../lib/WebsocketApp"              ),
  };

  var loadersAliases = {
    "backbone-data-sync": path.join( __dirname, "../loaders/backbone-data-sync"   ),
    "models" :            path.join( __dirname, "../loaders/models"               ),
    "pages":              path.join( __dirname, "../loaders/pages"                ),
    "controllers":        path.join( __dirname, "../loaders/controllers"          ),
    "log":                path.join( __dirname, "../loaders/log"                  ),
    "data":               path.join( __dirname, "../loaders/data"                 ),
    "bundles":            path.join( __dirname, "../loaders/bundles"              ),
    "websocket":          path.join( __dirname, "../loaders/websocket"            ),
  };

  var classes = {};
  var engines = [];
  var loaders = [];

  function resolvePath(name, aliasMap){
    // Absolute path
    if     ( name.indexOf("/") === 0 ) return name; 

    // Relative path - compose path based on project root
    else if( name.indexOf(".") === 0 ) return path.join( config.rootDir, name );
    
    // We have alias for it
    else if( aliasMap.hasOwnProperty(name) ) return aliasMap[name];

    // May be it is package that can be resolved from node_modules
    else return name;

  }

  env.classes = classes;

  _.each(config.structures, function(node, type){

    if( node.engines ) engines = engines.concat( node.engines );
    if( node.loaders ) loaders = loaders.concat( node.loaders );

    if(node.libs){
      env.helpers.deepExtend(classes, _.mapObject(node.libs || {}, function(val, key){
        if(Array.isArray(val)) {
          val = val.slice();
          val[0] = path.join(config.rootDir , val[0]);
          var result = bulk(val[0], val[1]);
          if(val[2]===true) env.helpers.traverse(result, function( target, nodeName, parent){
            parent[nodeName] = env.getCached(target);
          });
          return result;
        }
        else {
          var result = require( resolvePath( val, libsAliases ) );
          env.classes[key] = result;
          return result;
        }
      }));        
    }

  });

  engines = _.sortBy(_.uniq(engines), function( e ){ return e === "log" ? -1 : 1 } )
    .map(function(e){ return resolvePath( e, enginesAliases ); });
  if(config.mode === "test" && config.engines_fixtures) engines = engines.concat(config.engines_fixtures.map(function(p){
    return path.join(config.rootDir, p);
  }))

  loaders = _.uniq(loaders)
    .map(function(l){ return resolvePath( l, loadersAliases ); });
  if(config.mode === "test" && config.loaders_fixtures) loaders = loaders.concat(config.loaders_fixtures.map(function(p){
    return path.join(config.rootDir, p);
  }))

  var initChain = engines.concat(loaders).map(function(c){return require(c);});

  env.helpers.chain(initChain)(function(err){ cb(err, env); }, env );

};
