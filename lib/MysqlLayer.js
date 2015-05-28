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
function createConditionFromString(context, condition_template, field, query_template){
  // context: {    mysql: this.mysql,    data: data,    options: options    }
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


  

  parseOptions: function(data, options, cb){
    var self = this;
    if(typeof options === "function") cb = options, options = {}, context = {mysql: this.mysql, data:data, options: options};

    if(options.debug) data.debug = options.debug;

    if( options.fields 
        && _.isArray(options.fields) 
        && _.isEqual(
           _.intersection( _.keys(this.fields), options.fields).sort(),
           options.fields.sort()
        )
    ){
      data.fieldsList = options.fields;
    }else{data.fieldsList = this.publicFields || "*"}

    data.limit = "";
    if(options.hasOwnProperty("limit")) data.limit = "LIMIT "+this.mysql.escape(options.limit);
    

    data.order = "";
    if(options.hasOwnProperty("order") && this.fields.hasOwnProperty(options.order[0])){
      var direction = options.order.match(/asc|desc/);
      direction = direction? direction[0] : "ASC";
      data.order = "ORDER BY "+this.mysql.escape(options.order.replace(direction), "")+direction;
    }

    data.where = ""
    if(options.hasOwnProperty("where")){
      var conditions     = [];
      var allowed_fields = _.intersection( _.keys(this.fields), _.keys(options.where));
      if(allowed_fields.length){
        for(var i=0;i<allowed_fields.length;i++){
          
          if(_.isString(options.where[allowed_fields[i]])){
            conditions.push(createConditionFromString(context, conditionTemplates["="], allowed_fields[i]), options.where[allowed_fields[i]]) )
            // conditions.push({
            //   template: conditionTemplates["="],
            //   data: {
            //     field:allowed_fields[i], 
            //     val: options.where[allowed_fields[i]]
            //   }
            // });
          }
          else if(_.isArray(options.where[allowed_fields[i]])){
            var opts     = options.where[allowed_fields[i]];
            var operator = opts[0].toUpperCase();
            if(conditionTemplates.hasOwnProperty(first)){
              
            }
          }
        
        }
        

        data.where = "WHERE "+conditions.map(function(cond){
          return self.mysql.format(cond.template, cond.data);
        }).join(" AND ");
        
      }

    }



    return [data, cb];
  },

  createWhereFromObject: function(obj){
    var fields = _.intersection( _.keys(this.fields), _.keys(object)).sort();
    if(!fields.length) return;
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
    if     (_.isNumber(pattern))   { return this.findById(pattern, options, cb); }
    else if(_.isString(pattern))   { console.log("Not implemented - find -> String")   }
    else if(_.isArray(pattern))    { console.log("Not implemented - find -> Array")    }
    else if(_.isFunction(pattern)) { console.log("Not implemented - find -> Function") }
    else if(_.isObject(pattern))   { return this.findWhere(pattern, options, cb);   }
    else return cb("Not implemented");    
  },

  findWhere: function(pattern, options, cb){
    if(typeof options === "function") cb = options, options = {where: pattern};
    else options.where = pattern;

    return this.query.apply(this, ["SELECT @fieldsList FROM @tableName @where @limit @order" ].concat(this.parseOptions(pattern, options, cb)));
  },

  findById: function(id, options, cb){
    var query_data = {id: id};
    if(typeof options === "function"){cb = options, options = {}}
    else this.parseOptions(query_data, options);
    options.limit = 1;
    return this.query.apply(this, ["SELECT @fieldsList FROM @tableName WHERE @primaryKey = #id @limit" ].concat(this.parseOptions(query_data, options, cb)));
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
    instance.query = function(query, data, cb){
      _.extend(data, _.pick(this, ["tableName", "primaryKey"]));
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

  
