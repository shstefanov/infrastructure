var _          = require("underscore");
var DataLayer  = require("./DataLayer");
module.exports = DataLayer.extend("MongoLayer", {

  parseOptions: function(data, options, cb){

    if(typeof options === "function") cb = options, options = {};

    if(options.debug) data.debug = options.debug;
    if(options.fields && !_.isArray(options.fields) && _.isEqual(
      _.intersection( _.keys(this.fields), options.fields).sort(),
        options.fields.sort())
      ){
      data.fieldsList = options.fields;
    }else{data.fieldsList = this.publicFields || "*"}
    if(options.hasOwnProperty("limit")) data.limit = "LIMIT "+this.mysql.escape(options.limit);
    if(options.hasOwnProperty("order") && this.fields.hasOwnProperty(options.order)){
      var direction = options.order.match(/asc|desc/);
      direction = direction? direction[0] : "ASC";
      data.order = "ORDER BY "+this.mysql.escape(options.order.replace(direction), "")+direction;
    }


    return data;
  },

  create:  function(obj, options, cb){
    var self = this;
    var keys = Object.keys(obj).filter(function(key){return self.fields.hasOwnProperty(key)});
    this.query("INSERT INTO @tableName (@fieldsList) VALUES (#values);", {
      debug: "Тука нещо не е наред",
      fields: keys,
      values: keys.map(function(key){ return obj[key]})
    }, function(err, result){
      if (err) {console.log("ERROR: ", JSON.parse(JSON.stringify(err))); return cb(JSON.parse(JSON.stringify(err)));}
      obj[self.primaryKey] = result.insertId;
      cb(null, obj);
    });

  },

  find:    function(pattern, options, cb){
    if(_.isNumber(pattern)) { return this.findById(pattern, options, cb); }
    else return cb("Not implemented");    
  },

  findById: function(id, options, cb){
    var query_data = {id: id, limit: 1};
    if(typeof options === "function"){cb = options, options = {limit: 1}}
    else this.parseOptions(query_data, options);
    return this.query.apply(this, ["SELECT @fieldsList FROM @tableName WHERE @primaryKey = #id"].concat(this.parseOptions({id:id, limit: 1}, options, cb)));
  },

  findOne: function(pattern, options, cb){
    this.collection.findOne(pattern, options, cb);
  },

  delete:  function(pattern, options, cb){ 
    this.collection.remove(pattern, options, cb);
  },

  update:  function(){
    this.collection.update(pattern, options, cb);
  }
  
}, {


  setupDatabase: function(self, env){
    var Prototype   = this;
    self.driver     = env.mongodb;
    self.buildModel = function(cb){
      Prototype.setupTable(self, env, cb);
    }

  },

  setupTable: function(instance, env, cb){
    instance.mysql = env.mysql;
    if(!instance.tableName) instance.tableName = instance.name;
    var _ = require("underscore"), tableName = instance.tableName;
    instance.query = function(query, data, options, cb){
      var extension = _.pick(this, ["tableName", "primaryKey"]);
      var data = _.extend(this.parseOptions(data, options), extension);
      if(data.debug){
        env.do("log.debug", ["[ MySQL debug ]",
          [ " V V V V V V V V V V V V V V V V ","==============================================================================================>>>",
            data.debug,
            "SQL> "+instance.mysql.format(query, data),
            "==============================================================================================<<<",""
          ].join("\n")
        ]);
        delete data.debug;
      }
      return instance.mysql.query(query, data, cb);
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
