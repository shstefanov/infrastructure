// var AdvancedModel = require("./AdvancedModel");
// var AdvancedCollection = require("./AdvancedCollection");



module.exports = function(env){
  var line = "                       ";
  var _       = require("underscore");
  var mongodb = require("mongodb");
  var ObjectID = mongodb.ObjectID;

  function createGetRef(name){
    return function(){
      return new mongodb.DBRef(name, this.get("_id"));
    }
  }
  
  var MongoCollection = env.MongoCollection = env.AdvancedCollection.extend("MongoCollection", {

  });
 
  env.MongoModel = env.AdvancedModel.extend("MongoModel", {
    idAttribute: "_id",
    findModel: function(name){return env.Models[name];}, //Needed by queryGenerator
  },
  {
    db: env.db,

    extend:   function(name){
      var Model = env.AdvancedModel.extend.apply(this, arguments);
      Model.collectionName = name;
      Model.prototype.getRef = createGetRef(name);
      Model.buildModel = function(cb){
        Model.db.createCollection(name, Model.options || {}, function(err, collection){
          if(err) return cb(err);
          Model.coll       = Model.prototype.coll = collection;
          Model.Collection = MongoCollection.extend(name, 
            {model:    Model     },
            {coll:     collection}
          );

          if(Model.index){
            var ch = [];
            Model.index.forEach(function(i){
              ch.push(function(cb){
                //TODO - get collection indexes and drop removed if any
                Model.coll.ensureIndex(i.index,i.options||{}, function(err){
                  if(err) throw new Error("Strange error");
                  cb(err);
                }); 
              });
            });
            env._.chain(ch)(function(err){
              if(err) return cb(err);
              env.sys("model", "Model built:             "+name);
              
              cb();
            });
          }
          else {
            env.sys("model", "Model built:             "+name);
            cb();
          }
        });
      }

      return Model;
    },


    // DB methods
    create:  function(){
      console.log("MongoClusterModel")
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      
      var cb   = args.pop();
      var data = args.shift();
      var opts = args.length>0?args.pop():{};
      if(opts.fromJSON===true) data = this.prototype.convertJSON(data);
      
      var md = {
        isNew: true,
        validation: Self.prototype.validation,
        attributes: data
      }
      var error = Self.prototype.validate.call(md);
      if(error) return cb(error);
      Self.coll.insert.call(Self.coll, data, function(err, doc){ 
        console.log("Create callback", arguments);
        cb(err, !err?doc[0]:null); 
      });
    },


    find: function(){

      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb      = args.pop();
      var query   = args.shift();
      var options = args.shift()||{};
      args.push(function(err, cursor){
        if(err) return cb(err);
        cursor.toArray(function(err, docs){
          if(err) return cb(err);
          cb(null, docs.map(function(doc){
            return new Self(doc);
          }));
        });
      });
      this.coll.find.apply(this.coll, args);
      return this;
    },

    findOne: function(){
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb      = args.pop();
      var query   = args.shift();
      var options = args.shift()||{};

      this.coll.findOne(query, options, function(err, doc){
        if(err) return cb(err);
        if(doc===null) return cb(null, null);
        var error = Self.prototype.validate(doc);
        if(error) return cb(error);
        else cb(null, doc);
      });
    },

    remove:  function(){ 
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      var query = args.shift();
      this.coll.remove(query, cb);
    },

    findById: function(id, cb){
      if(!id) return cb("MongomModel.findById error: id can not be null");
      var pattern;
      try{pattern = {_id: ObjectID(id)}}catch(err){return cb(err);}
      this.findOne(pattern, cb);
    },

    findInId: function(ids, cb){
      if(!_.isArray(id)) return cb("MongomModel.findById error: id can not be null");
      if(ids.length===0) return cb(null, []);
      var pattern;
      try{ pattern = {$in: ids.map(ObjectID)} }catch(err){return cb(err);}
      this.find(pattern, cb);
    },

    update:  function(){
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      
      var cb      = args.pop();
      var query   = args.shift();
      var update  = args.shift();
      var options = atgs.pop()||{};
      var error = Self.prototype.validate.call(md);

      if(err) return cb(err);
      Self.coll.update(query, update, options, cb);
      return this;
    },


    // Models helpers
    queryGenerator: function(modelName, query, options){
      var defaults = Array.prototype.slice.call(arguments);
      defaults.shift();//Remove modelName
      return function(){
        var Model = this.findModel(modelName); //object must have find remote model by modelName
        if(!Model) throw new Error("")
        var args = parseArgs(
          sl.apply(arguments), 
          defaults.slice(),
          typeof this.contextPattern === "function"? this.contextPattern(modelName, options) : this.contextPattern
        );
        Model.coll.find.apply(Model, args);
        return this;
      }
    },

  
  });

  MongoCollection.prototype.model = env.MongoModel;
  // findGenerator helpers
  var sl = Array.prototype.slice;
  var ra = function(a){return a};
   
  // contextPattern examples:
  // initialize:     function(options){
  //   this.contextPattern = {"company.$id": this.get("_id")};
  // },



  var parseArgs = function(args, defaults, contextPattern){
    var num = args.length>=defaults.length? args.length : defaults.length;
    var result = [], q;
    for(var i=0;i<num;i++) {
      if(typeof args[i]==="function") q = args[i], result[i] = defaults[i];
      else      result[i] = _.extend({}, args[i], defaults[i])
   
      //TODO - write two functions and move this if to findGenerator generated function
      if(i===0&&contextPattern) result[i] = _.extend(result[i]||{}, contextPattern);
    }
    q&&result.push(q);
    return (result = result.filter(ra));
  };
}

