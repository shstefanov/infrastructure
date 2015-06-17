

module.exports = function(cb){


  var env = this;
  var config = env.config;
  if(!config.neo4j) return cb();

  var neo4j = require('neo4j');
  var db = new neo4j.GraphDatabase("http://"+(config.neo4j.host || "localhost")+":"+(config.neo4j.port || 7474));

  db.getNodeIndexes(function(err){
    console.log("neo4j", err.message);
    if(err) return cb(err);
  })


}