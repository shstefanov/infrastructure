
module.exports = function(cb){

  var env          = this;
  var config       = this.config;

  if(!config.mysql) return cb();

  var _          = require("underscore");
  var fs         = require("fs");
  var mysql      = require('mysql');
  var connection = mysql.createConnection(config.mysql);

  connection.config.queryFormat = function (query, data) {
    if (!data) return query;
    if(data.options) query = query.replace(/(@\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.options.hasOwnProperty(key)) {
        if(typeof data.options[key] === "function") return data.options[key].call(data.context,data.values, data.options);
        else return data.options[key];
      }
      return txt;
    });

    if(data.values) query = query.replace(/([#]\w+)/g, function (txt, key){
      key = key.slice(1);
      if(data.values.hasOwnProperty(key)) return mysql.escape(data.values[key]);
      return txt;
    });

    return query;
  };

  require.extensions['.sql'] = function(module, filename){
    module.exports = fs.readFileSync(filename, 'utf8').toString();
  };

  connection.connect(function(err){
    if(err) return cb(err);
    env.mysql = connection;
    env.do("log.sys", "mysql", "Connected to MySQL on "+(config.mysql.host || "localhost")+":"+(config.mysql.port||3306)+"/"+config.mysql.database );
    cb();
  });

};
