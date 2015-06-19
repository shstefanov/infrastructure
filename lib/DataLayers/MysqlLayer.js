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

function wrapArrayValues(operator, values, field, mysql){
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
      return [field, operator.toUpperCase(), mysql.escape(values[0])];
    case "BETWEEN":
      return Array.isArray(values[0])? [field, "BETWEEN", mysql.escape(values[0][0]), "AND", mysql.escape(values[0][1])]
        :[field, "BETWEEN", mysql.escape(values[0]), "AND", mysql.escape(values[1])];
    case "IN":
    case "NOT IN":
    default:
      return [field, operator.toUpperCase(), "(", mysql.escape(Array.isArray(values[0])?values[0]:values ), ")"];
  }
}

module.exports = DataLayer.extend("MySQLLayer", {





  // SELECT count(distinct p.products_id) as total 
  // FROM products p 
  // LEFT JOIN manufacturers m USING(manufacturers_id)
  // LEFT JOIN products_description pd using products_id
  // LEFT JOIN categories c USING (categories_id)
  // LEFT JOIN products_to_categories p2c USING (products_id)
  // LEFT JOIN meta_tags_products_description mtpd 
  //           ON mtpd.products_id= p2c.products_id 
  //           AND mtpd.language_id = 1 
  // WHERE (p.products_status = 1  
  //        AND pd.language_id = 1  
  //        AND (
  //             (pd.products_name LIKE '%3220%' 
  //              OR p.products_model LIKE '%3220%' 
  //              OR m.manufacturers_name LIKE '%3220%' 
  //              OR (mtpd.metatags_keywords LIKE '%3220%' 
  //                  AND  mtpd.metatags_keywords !='') 
  //              OR 
  //              (mtpd.metatags_description LIKE '%3220%' 
  //               AND   mtpd.metatags_description !='') 
  //              OR 
  //               pd.products_description LIKE '%3220%'
  //             ) 
  //            ) 
  //       )
  //       OR (p.products_id=3220)

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
      result.options.fields = _.intersection(this.publicFields || _.keys(this.fields), options.fields);
    }
    else result.options.fields = this.publicFields || "*";

    if(result.options.fields.length === 0) {
      result.options.fields = this.publicFields || "*";
    }

    if(options.limit){ result.options.limit = "LIMIT "+this.mysql.escape(options.limit); }
    else{ result.options.limit = ""; }

    if(options.count === true){
      result.options.count = ",COUNT(*)";
    }
    else result.options.count = "";

    if(options.order){
      var orderFields = typeof options.order === "string"?[options.order]:options.order, direction = "";
      if(_.last(options.order).match(/^(a|de)sc$/i)){
        direction = options.order.pop();
      }
      orderFields = _.intersection(this.publicFields || _.keys(this.fields), orderFields);
      if(orderFields.length){
        result.options.order = "ORDER BY "+orderFields.join(", ")+" "+direction.toUpperCase();
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
        for(var cond_field in allowed_conditions){
          var cond_value = allowed_conditions[cond_field];
          if(_.some([_.isNumber, _.isString, _.isDate, _.isNull], function(iterator){ return iterator(cond_value); })){
            conditions.push([cond_field, "=", this.mysql.escape(cond_value)].join(" "));
          }
          else if(Array.isArray(cond_value)){
            if(isOperator(cond_value[0])){
              var operator = cond_value[0];
              var rest     = cond_value.slice(1);
              conditions.push(wrapArrayValues(operator, rest, cond_field, this.mysql).join(" "));
            }
            else{
              conditions.push(wrapArrayValues("IN", cond_value, cond_field, this.mysql).join(" "));
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
      result.options.where = this.mysql.format(options.where, {options: _.extend({},options,_.pick(this, ["primaryKey", "publicFields", "tableName"])), values: data});
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
    this.query("INSERT INTO @tableName (@fields) VALUES ("+valuesTemplate+");", data, function(err, result){
      if(err) return cb(err);
      obj[self.primaryKey] = result.insertId;
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
    this.query("SELECT @fields FROM @tableName @where @order @order @limit;", data, function(err, models){
      // avoid third argument
      cb(err, models);
    });
  },

  count: function(pattern, options, cb){
    options.count = true;
    this.find(pattern, options, function(err, result){
      if(err) return cb(err);
      cb(null, result[0]["COUNT(*)"]);
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
      return field +" = #"+field;
    });
    data.options.updates = updates;

    this.query("UPDATE @tableName SET @updates @where @order @limit;", data, function(err, models){
      // avoid third argument
      cb(err, models);
    });


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

    this.query("DELETE FROM @tableName @where @order @limit;", data, function(err, models){
      // avoid third argument
      cb(err, models);
    });
  },

  
}, {

  setupDatabase: function(self, env){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupTable(self, env, cb); }
  },

  setupTable: function(instance, env, cb){
    instance.mysql = env.engines.mysql;
    var _ = require("underscore");
    instance.query = function(query, data, cb){
      _.extend(data.options, this.options, {tableName: this.tableName, primaryKey: this.primaryKey});
      if(data.options.debug){
        env.i.do("log.debug", ["[ MySQL debug ]",
          [ " V V V V V V V V V V V V V V V V ","==============================================================================================>>>",
            data.options.debug,
            "SQL> "+instance.mysql.format(query, data),
            "==============================================================================================<<<",""
          ].join("\n")
        ]);
        delete data.options.debug;
      }
      return this.mysql.query(query, data, cb);
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
