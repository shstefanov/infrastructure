var _          = require("underscore");
var DataLayer  = require("./DataLayer");


var conditionTemplates = {
  "=":           "@field = #val",
  ">":           "@field > #val",
  "<":           "@field < #val",
  ">=":          "@field >= #val",
  "<=":          "@field <= #val",
  "<>":          "@field <> #val",
  "!=":          "@field != #val",
  "<=>":         "@field <=> #val",
  "IS":          "@field IS #val",
  "IS NOT":      "@field IS NOT #val",
  "IN":          "@field IN (#val)",
  "NOT IN":      "@field NOT IN (#val)",
  "LIKE":        "@field LIKE #val",
  "NOT LIKE":    "@field NOT LIKE #val",

  "BETWEEN":     "@field BETWEEN #val_a AND #val_b",
  "NOT BETWEEN": "@field NOT BETWEEN #val_a AND #val_b"
};

function createObject(key, val){
  var obj = {};
  obj[key] = val;
  return obj;
}

function haveScalars(val){

}

function isScalar         (val){ return _.isString(val) || _.isNumber(val) || _.isNull(val); }
function isScalars        (val){ return _.isArray(val)  && _.every(val, isScalar); }
function isScalarOrScalars(val){ return isScalar(val)   || isScalarOrScalars(val); }

function matchFields(data, fieldsList){
  var keys           = _.keys(data).sort();
  var allowed_fields = _.intersection( fieldsList, keys).sort();
  return _.isEqual(keys, allowed_fields);
}

module.exports = DataLayer.extend("MongoLayer", {





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




  // parseOptions: function(data, options, cb){
  //   var self = this;
  //   if(typeof options === "function") cb = options, options = {};
  //   var context = { mysql: this.mysql, data:data, options: options };

  //   if(options.debug) data.debug = options.debug;

  //   if( options.fields 
  //       && _.isArray(options.fields) 
  //       && _.isEqual(
  //          _.intersection( _.keys(this.fields), options.fields).sort(),
  //          options.fields.sort()
  //       )
  //   ){
  //     data.fieldsList = options.fields;
  //   }else{data.fieldsList = this.publicFields || "*"}

  //   data.limit = "";
  //   if(options.hasOwnProperty("limit")) data.limit = "LIMIT "+this.mysql.escape(options.limit);
    

  //   data.order = "";
  //   if(options.hasOwnProperty("order") && this.fields.hasOwnProperty(options.order[0])){
  //     var direction = options.order.match(/asc|desc/);
  //     direction = direction? direction[0] : "ASC";
  //     data.order = "ORDER BY "+this.mysql.escape(options.order.replace(direction), "")+direction;
  //   }

  //   data.where = ""
  //   if(options.hasOwnProperty("where")){
  //     var conditions     = [];
  //     var allowed_fields = _.intersection( _.keys(this.fields), _.keys(options.where));
  //     if(allowed_fields.length){
  //       for(var i=0;i<allowed_fields.length;i++){
          
  //         if(_.isString(options.where[allowed_fields[i]])){
  //           conditions.push(
  //             createConditionFromString(context, conditionTemplates["="], allowed_fields[i], options.where[allowed_fields[i]])
  //           )
  //           // conditions.push({
  //           //   template: conditionTemplates["="],
  //           //   data: {
  //           //     field:allowed_fields[i], 
  //           //     val: options.where[allowed_fields[i]]
  //           //   }
  //           // });
  //         }
  //         else if(_.isArray(options.where[allowed_fields[i]])){
  //           var opts     = options.where[allowed_fields[i]];
  //           var operator = opts[0].toUpperCase();
  //           if(conditionTemplates.hasOwnProperty(first)){
              
  //           }
  //         }
        
  //       }
        

  //       data.where = "WHERE "+conditions.map(function(cond){
  //         return self.mysql.format(cond.template, cond.data);
  //       }).join(" AND ");
        
  //     }

  //   }



  //   return [data, cb];
  // },

  parseFindArguments: function(data, options, cb){
    console.log(arguments.length, arguments);
    switch(arguments.length){
      case 0:                                                                            return false;
      case 1:
        if(typeof data !== "function")                                                   return false;
        return [{},this.parseOptions({}),data];
      case 2:
        if( typeof options !== "function" ||  typeof data === "function")                return false;
        if( isScalar(data)  )                                                            return [createObject(this.primaryKey, data), this.parseOptions({limit: 1, $and:[createObject(this.primaryKey, "#"+this.primaryKey)]}), options];
        if(_.isArray(data) && isScalars(data))                                           return [createObject(this.primaryKey, data), this.parseOptions({          $and:[createObject(this.primaryKey, "#"+this.primaryKey)]}), options];
        if(_.isArray(data) && ( _.every(data, _.isObject)))                              return [{}, {$or: data}, options];
        if(!_.isObject(data)){
          if(data.$and && _.isArray(data.$and)) return [_.omit(data, ["$and", "$or"]), this.parseOptions({$and: data.$and}), options];
          if(data.$or &&  _.isArray(data.$or))  return [_.omit(data, ["$and", "$or"]), this.parseOptions({$or:  data.$or}),  options];
          if(_.every(data, isScalarOrScalars) && matchFields(data, this.publicFields || _.keys(this.fields)))
            return [_.clone(data), this.parseOptions({$and:[data]}), options];
        }
        return false;
      case 3:
        if(!_.isFunction(cb) || _.isArray(options) || _.isFunction(options) || isScalar(options)) return false;
        if( isScalar (data)  )                return [createObject(this.primaryKey, data), this.parseOptions(_.clone(options), {limit: 1}),  cb];
        if( isScalars(data)  )                return [createObject(this.primaryKey, data), this.parseOptions(_.clone(options)),              cb];
        if(data.$and && _.isArray(data.$and)) return [_.omit(data, ["$and", "$or"]), this.parseOptions(_.clone(options), {$and: data.$and}), cb];
        if(data.$or &&  _.isArray(data.$or))  return [_.omit(data, ["$and", "$or"]), this.parseOptions(_.clone(options), {$or:  data.$or}),  cb];

        return false;
    }
    return false;
  },

  parseOptions: function(options, extra){
    if(extra) _.extend(options, extra);

    options.TABLENAME = this.tableName;

    var fields;
    if(options.hasOwnProperty("fields")){
      if(!_.isArray(options.fields)) return false;
      fields = options.fields.sort();
    }
    else{
      fields = this.publicFields? this.publicFields.sort() : "*";
    }
    var allowed_fields = _.intersection( this.publicFields || _.keys(this.fields), _.keys(fields)).sort();
    if(fields === "*") options.FIELDSLIST = fields;
    else if(!_.isEqual(allowed_fields, fields)) return false;
    else options.FIELDSLIST = fields;

    if(options.limit && (isScalar(options.limit) || isScalars(options.limit))){
      options.LIMIT = this.mysql.format("LIMIT #limit", options);
    }
    else options.LIMIT = "";

    if(options.order && _.isString(options.order) && fields.indexOf(order) !== 0){
      options.ORDERBY = this.mysql.format("ORDER #order", options);
    }
    else{
      options.ORDERBY = "";
    }


    return options;
  },

  sendError: function(args, error){
    for(var i=0;i<args.length;i++){
      if(typeof args[i] === "function") args[i](error);
    }
  },

  buildCondition: function(data, condition){
    var self = this;
    if(_.each(condition, isScalar)){
      return _.keys(condition).map(function(){

      });
    }
  },

  findOperator: function(field, template, data){
    console.log("WTF???", arguments);
    if(isScalar(template)) return this.mysql.format([
      field, "=", template.match(/^[#@]/)? this.mysql.escape(template) : template
    ].join(" "), data);
    else if (Array.isArrsy(template)) return this.mysql.format([
      field, "IN", "(", template.match(/^[#@]/)? this.mysql.escape(template) : template, ")"
    ].join(" "), data);
  },

  buildWhereClause: function(data, options, cb){
    if(!options.$and && !options.$or) return _.extend(options, {WHERE: ""});
    var self = this;
    if(options.$and){
      console.log("$and", data, options);
      options.WHERE = "WHERE "+options.$and.map(function(cond){
        var result = "";
        for(var key in cond){
          if(self.fields.hasOwnProperty(key)){
            result+=self.findOperator(key, cond[key], data);
          }
        }
        return result;
      }).join(" AND ");
    }

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

  find:    function(){
    var args = this.parseFindArguments.apply(this, arguments);
    if(!args) return this.sendError(arguments, "invalid arguments");
    if(args[1] === false) return cb && cb("Invalid options");
    this.buildWhereClause.apply(this, args);
    var query = "SELECT @FIELDSLIST FROM @TABLENAME @WHERE @LIMIT @ORDERBY";
    this.query.apply(this, [query].concat(args));
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
    var _ = require("underscore");
    instance.query = function(query, data, options, cb){

      query = env.mysql.format(query, options);

      // if(data.debug){
        env.do("log.debug", ["[ MySQL debug ]",
          [ " V V V V V V V V V V V V V V V V ","==============================================================================================>>>",
            data.debug,
            "SQL> "+instance.mysql.format(query, data),
            "==============================================================================================<<<",""
          ].join("\n")
        ]);
        delete data.debug;
      // }
      return instance.mysql.query(query, data, cb);
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
