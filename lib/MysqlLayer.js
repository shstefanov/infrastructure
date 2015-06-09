var _          = require("underscore");
var DataLayer  = require("./DataLayer");

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

  parseArguments: function(args){
    switch(args.length){
      case 0: return false;
      case 1:
        if(typeof args[0] !== "function") return false;
        else return [{},{},args[0]];
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
    if(options.fields){
      result.options.fields = _.intersection(this.publicFields || _.keys(this.fields), options.fields);
    }
    else result.options.fields = _.keys(dataFields);

    if(result.options.fields.length === 0) {
      result.options.fields = this.publicFields || "*";
    }

    if(options.limit){ result.options.limit = "LIMIT "+this.mysql.escape(options.limit); }
    else{ result.options.limit = ""; }

    if(options.order){
      var orderFields = options.order, direction = "";
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


    if(options.where){

    }
    else result.options.where = "";




    result.values = data;
    return result;
  },

  create:  function(obj, options, cb){
    var data = this.parseData(obj, options), self = this;
    var valuesTemplate = data.options.fields.map(function(fieldName){return "#"+fieldName}).join(",");
    this.query("INSERT INTO @tableName (@fields) VALUES ("+valuesTemplate+");", data, function(err, result){
      if(err) return cb(err);
      obj[self.primaryKey] = result.insertId;
      cb(null, obj);
    });
  },

  find:    function(pattern, options, cb){
    if(typeof pattern === "number" || typeof pattern === "string" || pattern.hasOwnProperty(this.primaryKey)){
      return 
    }
    var data = this.parseData(pattern, options), self = this;
    this.query("SELECT @fields FROM @tableName @where @order @limit;", data, function(err, models){
      // avoid third argument
      cb(err, models);
    });
  },

  findById: function(id, options, cb){
    
  },

  findOne: function(pattern, options, cb){

  },

  delete:  function(pattern, options, cb){ 

  },

  update:  function(){

  }
  
}, {

  setupDatabase: function(self, env){
    var Prototype   = this;
    self.setupNode = function(cb){ Prototype.setupTable(self, env, cb); }
  },

  setupTable: function(instance, env, cb){
    instance.mysql = env.mysql;
    var _ = require("underscore"), tableName = instance.tableName;
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
        delete data.debug;
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

  
