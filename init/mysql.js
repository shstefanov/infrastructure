
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

  require.extensions['.sql'] = function(module, filename){
    var sql_string = fs.readFileSync(filename, 'utf8').toString();
    var filters    = [], ctx;
    var fn = function(data, options, cb){
      return (ctx || this).query(sql_string, data, cb);
    };
    fn.filter = function(filter_fn){
      var next = filters.length?filters.pop():fn;
      var filter = function(){
        ctx = this;
        filter_fn.apply(ctx||this, arguments)
      };
      filters.push(filter);
      filter.filter = fn.filter;
      return filter;
    }

    module.exports = fn;
  };

  connection.connect(function(err){
    if(err) return cb(err);
    env.mysql = connection;
    env.do("log.sys", ["mysql", "Connected to MySQL on "+(config.mysql.host || "localhost")+":"+(config.mysql.port||3306)+"/"+config.mysql.database] );
    cb();
  });

};
