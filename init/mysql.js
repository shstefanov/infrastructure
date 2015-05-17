
module.exports = function(cb){

  var env          = this;
  var config       = this.config;

  if(!config.mysql) return cb();

  var mysql      = require('mysql');
  var connection = mysql.createConnection(config.mysql);

  connection.connect(function(err){
    if(err) return cb(err);
    env.mysql = connection;
    env.call("log.sys", ["mysql", "Connected to MySQL on "+(config.mysql.host || "localhost")+":"+(config.mysql.port||3306)+"/"+config.mysql.database] );
    cb();
  });

};
