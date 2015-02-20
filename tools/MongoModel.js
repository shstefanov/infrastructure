// var AdvancedModel = require("./AdvancedModel");
// var AdvancedCollection = require("./AdvancedCollection");


// module.exports = function(env){

//   var _       = require("underscore");
//   var mongodb = require("mongodb");

// };









module.exports = function(env){

  var _       = require("underscore");
  var mongodb = require("mongodb");

  function createGetRef(name){
    return function(){
      return new mongodb.DBRef(name, this.get("_id"));
    }
  }
  
  var MongoCollection = env.MongoCollection = env.AdvancedCollection.extend("MongoCollection", {

  });
 
  env.MongoModel = env.AdvancedModel.extend("MongoModel", {
    idAttribute: "_id",
   

    

    toJSON: function(){
      if(this.error) return {error: this.error};
      return env.AdvancedModel.prototype.toJSON.call(this);
    },

  },

  {
    db: env.db,

    defaults: {},

    validate: function(obj, isNew){
      var error = false, errors = {invalid: []};
      if(!_.isObject(obj)) return {error: "Not object"};

      var validation_keys = _.keys(this.validation);
      var object_keys     = _.keys(obj);

      if(isNew) validation_keys = _.without(validation_keys, ["_id"]);

      var missing    = _.difference(validation_keys, object_keys);
      var redundant  = _.difference(object_keys, validation_keys);

      if(missing.length>0)   {errors.missing = missing; error = true;};
      if(redundant.length>0) {errors.redundant = redundant; error = true;};

      var for_check = _.without(_.intersection(object_keys, validation_keys), missing);
      var self = this, invalid = [];
      for(var i=0;i<for_check.length;i++){
        var field = for_check[i];
        var fn    = this.validation[field];
        var value = obj[field];
        if(!fn(value)) {
          error = true;
          invalid.push(field);
          errors.invalid = invalid;
        }
      }
      return error?errors:undefined;
    },

    // objectify: function(obj, objectifier){
    //   //analize this.validation object and find which fields to objectify
    //   return obj;
    // },

    findModel: function(name){return env.Models[name];},

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
    create:  function(data, cb){
      _.defaults(data, this.defaults);
      this.objectify(data);
      var error = this.validate(data, true);
      if(error) return cb(error);
      this.coll.insert(data, function(err, model){cb(err, model[0])});
    },

    find: function(){
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      args.push(function(err, cursor){
        if(err) return cb(err);
        cursor.toArray(function(err, docs){
          if(err) return cb(err);
          var error = _.some(docs, function(doc){
            return !!self.validate(doc);
          });
          console.log("error: ", error)
          if(error) return cb("Invalid objects in result");
          cb(null, docs);
        });
      });
      this.coll.find.apply(this.coll, args);
      return this;
    },

    findOne: function(){
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      var cb = args.pop();
      args.push(function(err, doc){
        if(err) return cb(err);
        var error = self.validate(doc);
        if(error) return cb(error);
        cb(null, doc);
      });
      this.coll.findOne.apply(this.coll, args);
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


    // // Models helpers
    // queryGenerator: function(modelName, query, options){
    //   var defaults = Array.prototype.slice.call(arguments);
    //   defaults.shift();//Remove modelName
    //   return function(){
    //     var Model = this.findModel(modelName); //object must have find remote model by modelName
    //     if(!Model) throw new Error("")
    //     var args = parseArgs(
    //       sl.apply(arguments), 
    //       defaults.slice(),
    //       typeof this.contextPattern === "function"? this.contextPattern(modelName, options) : this.contextPattern
    //     );
    //     Model.coll.find.apply(Model, args);
    //     return this;
    //   }
    // },

  
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
