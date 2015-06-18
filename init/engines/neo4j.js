module.exports = function(cb){

  var env = this;
  var config = env.config;
  if(!config.neo4j) return cb();

  var neo4j = require('neo4j-io')("http://"+(config.neo4j.host || "localhost")+":"+(config.neo4j.port || 7474));
  var cypher = 'MATCH (n:NODE) RETURN n LIMIT 1';
  neo4j
    .query(cypher)
    .then(function(){
      env.engines.neo4j = neo4j;
      env.i.do("log.sys", "ne04j", "Connected to Neo4J on "+(config.neo4j.host || "localhost")+":"+(config.neo4j.port||5432));
      cb();
    })
    .catch(function(err){
      cb(err);
    });
}