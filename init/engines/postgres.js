
module.exports = function(cb){

  var createURL = function(conf){
    var cr = "";
    if(conf.username && conf.password) cr = conf.username+":"+conf.password+"@";
    return "postgres://"+cr+(conf.host||"localhost")+":"+(conf.port||"5432")+"/"+(conf.database||conf.db);
  };

  var _            = require("underscore");
  var env          = this;
  var config       = this.config;

  if(!config.postgres) return cb();
  var pg           = require("pg");
  var connectURL   = createURL(config.postgres);
  pg.connect(connectURL, function(err, client, release) {
    if(err) return cb(err);
    client.format = queryFormat;
    env.engines.postgres  = client;
    env.engines.postgres.release = release;
    env.i.do("log.sys", "postgres", "Connected to PostgreSQL on "+(config.postgres.host || "localhost")+":"+(config.postgres.port||5432)+"/"+(config.postgres.database||config.postgres.db) );
    cb();
  });


  function queryFormat(template, data){
    if (!data) return template;
    var self = this;

    if(data.options) template = template.replace(/(@\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.options.hasOwnProperty(key)) {
        return data.options[key];
      }
      return txt;
    });

    if(data.options) template = template.replace(/(%\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.options.hasOwnProperty(key)) {
        if(typeof data.options[key] === "function") {return self.escapeIdentifier(data.options[key].call(data.context,data.values, data.options));}
        else if(data.options[key] === "" || typeof data.options[key] === "undefined") return "";
        else if(key === "fields" && data.options[key] === "*") return "*";
        else {
          return Array.isArray(data.options[key])?
            data.options[key].map(function(identifier){return identifier.split(".")}).map(function(identifier_parts){
              return identifier_parts.map(self.escapeIdentifier).join(".");
            }).join(",") : data.options[key].split(".").map(self.escapeIdentifier).join(".");
        }
      }
      return txt;
    });

    if(data.values) template = template.replace(/([#]\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.values.hasOwnProperty(key)){
        return Array.isArray(data.values[key])?data.values[key].map(function(v){return v.toString();}).map(self.escapeLiteral).join(","):self.escapeLiteral(data.values[key].toString());
      } 
      return txt;
    });

    return template;


  }



};
