
module.exports = function(cb){

  var env          = this;
  var config       = this.config;

  if(!config.mysql) return cb();

  var _          = require("underscore");
  var fs         = require("fs");
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
    var chain    = [], ctx;
    var exec = function(data, cb){
      console.log("exec", sql_string, data, cb);
      var r = this.query(sql_string, data, cb);
      console.log("exec - after");
      return r;
    };

    exec.chain = function(arg){
      var fn;
      if(_.isString(arg)){
        if(arg.indexOf(".")!=-1){
          fn = function(){
            var args = Array.prototype.slice.call(arguments);
            var cb = args.pop();
            env.do(arg, args, cb);
          }
          chain.push(fn);
        }
        else{
          chain.push(function(){
            var args = Array.prototype.slice.call(arguments);
            var cb = args.pop();
            if(!_.isFunction(this[arg])) return cb("Can't find target "+ arg);
            this[arg].apply(this, arguments);
          })
        }
      }
      else if(_.isFunction(arg)){
        chain.push(arg);
      }
      else if(_.isObject(arg)){
        for(var key in arg){
          (function(prop, val){
            if(typeof arg[prop] === "string"){
              arg[prop] = function(){
                var args = Array.prototype.slice.call(arguments);
                var cb = args.pop();
                env.do(val, args, cb);
              }
            }
          })(key, arg[key]);
        }
        chain.push(function(){
          var args = Array.prototype.slice.call(arguments);
          var cb = args.pop();
          env.helpers.amap(arg, args, cb);
        });
      }

      var composed   = env.helpers.chain(chain.concat([exec]));
      composed.chain = exec.chain;
      return composed;
    }




    module.exports = exec;
  };

  connection.connect(function(err){
    if(err) return cb(err);
    env.mysql = connection;
    env.do("log.sys", ["mysql", "Connected to MySQL on "+(config.mysql.host || "localhost")+":"+(config.mysql.port||3306)+"/"+config.mysql.database] );
    cb();
  });

};
