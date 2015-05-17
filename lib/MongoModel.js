// var AdvancedModel = require("./AdvancedModel");
// var AdvancedCollection = require("./AdvancedCollection");



module.exports = function(env){

  var _       = require("underscore");
  var mongodb = require("mongodb");
  
  var MongoCollection = env.MongoCollection = env.ExtendedCollection.extend("MongoCollection", {

  });
 
  env.MongoModel = env.ExtendedModel.extend("MongoModel", {
    idAttribute: "_id",

    toJSON: function(){
      if(this.error) return {error: this.error};
      return env.ExtendeddModel.prototype.toJSON.call(this);
    },

    constructor: function(data){

      if(!data){
        this.error = "Can't find model";
        return this;
      }
      else if(!_.isObject(data)){
        this.error = "Model should be object";
      }
      var err = this.validate(data);
      if(err){
        this.error = err;
        return env.ExtendedModel.apply(this, []);
      }

      return env.ExtendedModel.apply(this, arguments);
    }
  },

  {
    db: env.db,

    extend:   function(name){
      var Model = env.AdvancedModel.extend.apply(this, arguments);
      Model.collectionName = name;
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
                  cb(err);
                }); 
              });
            });
            env._.chain(ch)(cb);
          }
          else cb();
        });
      }



      return Model;
    },


    // DB methods
    create:  function(){
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      var md = {
        isNew: true,
        validation: Self.prototype.validation,
        attributes: args[0]
      }
      var error = Self.prototype.validate.apply(md);
      if(error) return cb(error);
      args.push(function(err, doc){ cb(err, new Self(doc)); });
      Self.coll.insert(md.attributes)
    },

    find:    function(){
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      args.push(function(err, cursor){
        if(err) return cb(err);
        cursor.toArray(function(err, docs){
          if(err) return cb(err);
          cb(null, docs.map(function(doc){
            return new Self(doc);
          }));
        });
      });
      this.coll.find.apply(this, args);
      return this;
    },

    findOne: function(){
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      args.push(function(err, doc){
        if(err) return cb(err);
        var model = new Self(doc);
        cb(model.error, model);
      });
      this.coll.findOne.apply(this, args);
      return this;
    },

    remove:  function(){ 
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      if(_.isArray(args[0])){
        env._.amap(args[0], function(model, cb){
          Self.coll.remove({_id: model.get("_id")}, cb);
        }, cb);
      }
      else{
        Self.coll.remove({_id: args[0].get("_id")}, cb);
      }
      return this;
    },

    update:  function(){
      var Self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      if(_.isArray(args[0])){
        env._.amap(args[0], function(model, cb){
          var err = model.validate();
          if(err) return cb(err);
          Self.coll.update(
            {_id: model.get("_id")}, 
            model.omit("_id"),
            cb);
        }, cb);
      }
      else{
        var err = model.validate();
        if(err) return cb(err);
        Self.coll.update({_id: model.get("_id")}, model.omit("_id"), cb);
      }
      return this;
    },


    // Models helpers
    queryGenerator: function(modelName, query, options){
      var defaults = Array.prototype.slice.call(arguments);
      defaults.shift();//Remove modelName
      return function(){
        var Model = this.findModel(modelName); //object must have find remote model by modelName
        if(!Model) throw new Error("");
        var args = parseArgs(
          sl.apply(arguments), 
          defaults.slice(),
          typeof this.contextPattern === "function"? this.contextPattern(modelName, options) : this.contextPattern
        );
        var cb = args.pop();
        args.push(function(err,cursor){err?cb(err):cursor.toArray(cb);})
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