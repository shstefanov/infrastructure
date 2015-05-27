
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
    env.postgres  = client;
    env.postgres.release = release;
    env.do("log.sys", "postgres", "Connected to MongoDB on "+(config.postgres.host || "localhost")+":"+(config.postgres.port||5432)+"/"+(config.postgres.database||config.postgres.db) );
    cb();
  });

};
