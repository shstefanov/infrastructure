
module.exports = function(cb){

  var env          = this;
  var config       = this.config;

  if(!config.mysql) return cb();

  var mysql      = require('mysql');
  var connection = mysql.createConnection(config.mysql);

  connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/([@#]\w+)/g, function (txt, key) {
      var type = key.charAt(0), key = key.slice(1);
      if (values.hasOwnProperty(key)) {
        return type==="#"?mysql.escape(values[key]):values[key];
      }
      return txt;
    });
  };

  connection.connect(function(err){
    if(err) return cb(err);
    env.mysql = connection;
    env.do("log.sys", ["mysql", "Connected to MySQL on "+(config.mysql.host || "localhost")+":"+(config.mysql.port||3306)+"/"+config.mysql.database] );
    cb();
  });

};
