var _          = require("underscore");
var DataLayer  = require("./DataLayer");

var operatorsRE = [
  /^=$/i,
  /^between$/i,
  /^not\sbetween$/i,
  /^[<>]=?$/i,
  /^<=?>$/i,
  /^!=$/i,
  /^in$/i,
  /^not\sin$/i,
  /^is$/i,
  /^is\snot$/i,
  /^like$/i,
  /^not\slike$/i,
  /^not$/i,
];

function isOperator(val){
  return _.some(operatorsRE, function(re){
    return re.test(val);
  });
}

function wrapArrayValues(operator, values, field, postgres){
  field = field.split(".").map(postgres.escapeIdentifier).join(".");
  switch(operator.toUpperCase()){
    case "=":
    case "!=":
    case ">":
    case "<":
    case "<>":
    case "<=>":
    case ">=":
    case "<=":
    case "NOT":
    case "IS":
    case "IS NOT":
    case "LIKE":
    case "NOT LIKE":
      return [field, operator.toUpperCase(), postgres.escapeLiteral(values[0].toString())];
    case "BETWEEN":
      return Array.isArray(values[0])? [field, "BETWEEN", postgres.escapeLiteral(values[0][0].toString()), "AND", postgres.escapeLiteral(values[0][1].toString())]
        :[field, "BETWEEN", postgres.escapeLiteral(values[0].toString()), "AND", postgres.escapeLiteral(values[1].toString())];
    case "IN":
    case "NOT IN":
    default:
      var vals = (Array.isArray(values[0])? values[0]: values).map(function(v){return v.toString();}).map(postgres.escapeLiteral).join(",");
      return [field, operator.toUpperCase(), "(", vals, ")"];
  }
}

module.exports = DataLayer.extend("PostgresLayer", {

  parseArguments: function(args){
    switch(args.length){
      case 0: return false;
      case 1:
        if(typeof args[0] !== "function") return false;
        else return [undefined,{},args[0]];
      case 2:
        if(typeof args[1] !== "function") return false;
        else return [args[0],{}, args[1]];
      case 3:
        if(typeof args[2] !== "function") return false;
        else return [args[0],args[1], args[2]];
      default: return false;
    }
  },

  parseData: function(data, options){
    var result = {options: {}};
    var dataFields  = _.pick(data, _.keys(this.fields));

    if(options.count){
      result.options.fields = "COUNT(*)";
    }
    else if(options.fields){
      result.options.fields = _.intersection(this.publicFields || _.keys(this.fields), options.fields).map(this.postgres.escapeIdentifier);
    }
    else result.options.fields = this.publicFields?this.publicFields.map(this.postgres.escapeIdentifier) : "*";

    if(result.options.fields.length === 0) {
      result.options.fields = this.publicFields || "*";
    }

    if(options.limit){ 
      if(Array.isArray(options.limit)){
        result.options.limit = "LIMIT "+this.postgres.escapeLiteral(options.limit[0].toString())+" OFFSET "+ this.postgres.escapeLiteral(options.limit[1].toString());
      }
      else result.options.limit = "LIMIT "+this.postgres.escapeLiteral(options.limit.toString());
    }
    else{ result.options.limit = ""; }

    if(options.order){
      var orderFields = typeof options.order === "string"?[options.order]:options.order, direction = "";
      if(typeof options.order === "string") options.order = [options.order];
      if(_.last(options.order).match(/^(a|de)sc$/i)){
        direction = options.order.pop();
      }
      orderFields = _.intersection(this.publicFields || _.keys(this.fields), orderFields);
      if(orderFields.length){
        result.options.order = "ORDER BY "+orderFields.map(this.postgres.escapeIdentifier).join(", ")+" "+direction.toUpperCase();
      }
      else{
        result.options.order = "";
      }
    }
    else result.options.order = "";

    if(options.where && typeof options.where !== "string" ){
      var cond_fields = _.intersection(this.publicFields || _.keys(this.fields), _.keys(options.where));
      if(cond_fields.length===0) result.options.where = "";
      else{
        var conditions  = [];
        var allowed_conditions = _.pick(options.where, cond_fields);
        for(var field in allowed_conditions){
          var cond_field = field;
          var cond_value = allowed_conditions[field];
          if(_.some([_.isNumber, _.isString, _.isDate, _.isNull], function(iterator){ return iterator(cond_value); })){
            conditions.push([(cond_field.split(".").map(this.postgres.escapeIdentifier).join(".")), "=", this.postgres.escapeLiteral(cond_value.toString())].join(" "));
          }
          else if(Array.isArray(cond_value)){
            if(isOperator(cond_value[0])){
              var operator = cond_value[0];
              var rest     = cond_value.slice(1);
              conditions.push(wrapArrayValues(operator, rest, cond_field, this.postgres).join(" "));
            }
            else{
              conditions.push(wrapArrayValues("IN", cond_value, cond_field, this.postgres).join(" "));
            }
          }
          else if(_.isFunction(cond_value)){
            throw new Error("TODO - computed where condition");
          }
          else if(_.isObject(cond_value)){
            throw new Error("TODO - where condition as object");
          }
          else result.options.where = "";

        }
        result.options.where = "WHERE "+conditions.join(" AND ");
      }
    }
    else if(typeof options.where == "string"){
      result.options.where = this.postgres.format(options.where, {options: _.extend({},options,_.pick(this, ["primaryKey", "publicFields", "tableName"])), values: data});
    }
    else result.options.where = "";

    _.defaults(result.options, _.omit(options, ["where", "order", "limit", "fields"]));


    result.values = data;
    return result;
  },

  create:  function(obj, options, cb){
    var data = this.parseData(obj, options), self = this;
    data.options.fields = _.intersection(this.publicFields || _.keys(this.fields), _.keys(obj));
    var valuesTemplate = data.options.fields.map(function(fieldName){return "#"+fieldName}).join(",");
    this.query("INSERT INTO %tableName (%fields) VALUES ("+valuesTemplate+") RETURNING %primaryKey;", data, function(err, result){
      if(err) return cb(err);
      obj[self.primaryKey] = result.rows[0][self.primaryKey];
      cb(null, obj);
    });
  },

  find:    function(pattern, options, cb){
    if(typeof pattern === "number" || typeof pattern === "string"){
      options.where = {}, options.limit = 1;
      options.where[this.primaryKey] = pattern; 
    }
    else if(Array.isArray(pattern)){
      options.where = {}, options.limit = pattern.length;
      options.where[this.primaryKey] = ["IN", pattern];
    }
    else{
      options.where = pattern;
    }
    var data = this.parseData(pattern, options), self = this;
    this.query("SELECT @fields FROM %tableName @where @order @limit;", data, function(err, models){
      // avoid third argument
      cb(err, models? models.rows : models);
    });
  },

  count: function(pattern, options, cb){
    options.count = true;
    return this.find(pattern, options, function(err, result){
      if(err) return cb(err);
      cb(null, result[0].count);
    });
  },

  findOne: function(pattern, options, cb){
    options.limit = 1;
    return this.find(pattern, options, cb);
  },

  update:  function(pattern, options, cb){
    var self = this;
    var fields = _.intersection(this.publicFields || _.keys(this.fields), _.keys(pattern));
    if(fields.length === 0) return cb("Invalid fields to update");

    if(fields.indexOf(this.primaryKey)!==-1){
      options.where = _.pick(pattern, [this.primaryKey]);
      fields = _.without(fields, this.primaryKey);
      if(Array.isArray(pattern[this.primaryKey])) {
        options.limit = pattern[this.primaryKey].length;
        if(!isOperator(options.where[this.primaryKey][0])) {
          
          options.where[this.primaryKey] = ["IN", options.where[this.primaryKey]];
        }
      }
      else options.limit = 1;
    }
    var data = this.parseData(pattern, options), self = this;
    var updates = fields.map(function(field){
      return self.postgres.escapeIdentifier(field) +" = #"+field;
    });
    data.options.updates = updates;
    this.query("UPDATE %tableName SET @updates @where;", data, cb);
  },

  delete:  function(pattern, options, cb){ 

    if(typeof pattern === "number" || typeof pattern === "string"){
      options.where = {}, options.limit = 1;
      options.where[this.primaryKey] = pattern; 
    }
    else if(Array.isArray(pattern)){
      options.where = {}, options.limit = pattern.length;
      options.where[this.primaryKey] = ["IN", pattern];
    }
    else{
      options.where = pattern;
    }
    var data = this.parseData(pattern, options), self = this;
    this.query("DELETE FROM %tableName @where;", data, cb);
  },

}, {

  setupDatabase: function(self, env, name){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupTable(self, env, function(err){
      if(err) return cb(err);
      env.i.do("log.sys", "DataLayer:postgres", name);
      cb();
    }); }
  },

  setupTable: function(instance, env, cb){
    instance.postgres = env.engines.postgres;
    var _ = require("underscore");
    instance.query = function(query, data, cb){
      _.extend(data.options, this.options, {tableName: this.tableName, primaryKey: this.primaryKey});
      if(data.options.debug){
        env.i.do("log.debug", ["[ Postgres debug ]",
          [ " V V V V V V V V V V V V V V V V ","==============================================================================================>>>",
            data.options.debug,
            "postgres> "+instance.postgres.format(query, data),
            "==============================================================================================<<<",""
          ].join("\n")
        ]);
        delete data.options.debug;
      }

      return this.postgres.query(this.postgres.format(query, data), function(err, results){
        instance.postgres.release();
        cb(err, results);
      });
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
