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
    var self = this;
    switch(args.length){
      case 0: return false;
      case 1: 
        if(typeof args[0] === "string" && args[0].indexOf(".") !== -1){
          var address = args[0];
          return [{}, {}, function(err, result){
            console.log("???", address, err, result);
            self.env.do(address, err, result);}];
        }
        else if(typeof args[0] === "function") return [{}, {}, args[0]];
        else return false;
      case 2:
        if(typeof args[0] === "function") return false;
        else if(typeof args[1] === "string" && args[1].indexOf(".") !== -1){
          var address = args[1];
          return [args[0] || {}, {}, function(err, result){self.env.do(address, err, result);}];
        }
        else if(typeof args[1] === "function") return [args[0] || {}, {}, args[1]];
        else return false;
      case 3:
        if(typeof args[0] === "function" || typeof args[1] === "function") return false;
        else if(typeof args[2] === "string" && args[2].indexOf(".") !== -1){
          var address = args[2];
          return [args[0]||{}, args[1]||{}, function(err, result){self.env.do(address, err, result);}];
        }
        else if(typeof args[2] === "function") return [args[0]||{},args[1]||{}, args[2]];
        else return false;
      default:
        return false;
    }
  },

  sendCallbacks: function(args, err, result){
    for(var i=(args.length-1);i<=0;i--){
      if(typeof args[i] === "function") args[i](err, result);
    }
  },

  create:  function(obj, options, cb){
    var args;
    if(!(args = this.parseArguments(arguments))) return this.sendCallbacks(arguments, "Invalid arguments");
    var values;
    if(typeof this.options.insert_fields === "function") values = this.options.insert_fields.apply(this, args.slice(0,1)).toString().replace(/(\w+)/g, "#$1");
    else values = this.options.insert_fields.toString().replace(/(\w+)/g, "#$1");
    var self = this;
    obj = args[0], cb = args[2];
    // wrap callback to assign primary id
    args[2] = function(err, result){
      if(err) return cb(err);
      obj[self.options.primaryKey] = result.insertId;
      cb(null, obj);
    };
    args.unshift("INSERT INTO @table (@insert_fields) VALUES ("+values+");");
    this.query.apply(this, args);
  },

  find:    function(pattern, options, cb){
    var args;
    if(!(args = this.parseArguments(arguments))) return this.sendCallbacks(arguments, "Invalid arguments");
    console.log("find args", args);
    var fields;
    if(typeof this.options.select_fields === "function") fields = this.options.select_fields.apply(this, args.slice(0,1));
    else fields = this.options.select_fields.toString().replace(/(\w+)/g, "#$1");
    args.unshift("SELECT @select_fields FROM @table @where");
    this.query.apply(this, args);
  },

  findWhere: function(pattern, options, cb){

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
      if(instance.options) options = _.extend({}, options, instance.options);
      if(options.debug){
        env.do("log.debug", ["[ MySQL debug ]",
          [ " V V V V V V V V V V V V V V V V ","==============================================================================================>>>",
            data.debug,
            "SQL> "+instance.mysql.format(query, {values: data, options: options, context: instance}),
            "==============================================================================================<<<",""
          ].join("\n")
        ]);
        delete data.debug;
      }
      return instance.mysql.query(query, {values: data, options: options, context: instance}, cb);
    }
    cb();
  },

  extend: function(name, props, statics){
    this.setMethods(this.prototype, props);
    return DataLayer.extend.apply(this, arguments);
  }
});

  
