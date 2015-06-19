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

  neo4j.format = function(query, data, cb){
    if (!data) return query;
    if(data.options) query = query.replace(/(@\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.options.hasOwnProperty(key)) {
        if(typeof data.options[key] === "function") return data.options[key].call(data.context, data.values, data.options);
        else return data.options[key];
      }
      return txt;
    });

    if(data.values) query = query.replace(/([#]\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.values.hasOwnProperty(key)) return escape(data.values[key]);
      return txt;
    });

    return query;
  }

  neo4j.escape = escape;

  function escape(val){
    if(Array.isArray(val)){
      var self = this;
      return val.map(function(v, index, val){return escape(val[index]);}).join(",");
    }
    else{
      if(typeof val === "number") return val.toString();
      else return "\""+val.toString().replace(/\\/g, "\\\\").replace(/"/g, "\\\"")+"\"";
    }
  }



}