// var AdvancedModel = require("./AdvancedModel");
// var AdvancedCollection = require("./AdvancedCollection");

module.exports = function(env){

  var _ = require("underscore");
  var safe = {safe: true};
  var MongoCollection = env.AdvancedCollection.extend("MongoCollection", {
    
  });


  var Cursor         = env.MongoDB.Cursor;
  Cursor.extend      = env.Class.extend;
  Cursor.__className = "Class_Cursor";

  var BackboneCursor = Cursor.extend("BackboneCursor", {

    toModel: function(model, cb){
      var Model = this.Model;
      if(typeof model === "function" && !cb){
        cb = model, 
        model = new Model();
      }
      this.each(function(err, doc){
        if(err) {
          model.trigger("error", err); 
          return cb&&cb(err);
        }
        if(doc === null){
           model.trigger("error", "Can't find model");
           return cb&&cb("Can't find model");}
        var error = model.validate(doc);
        if(error){
          model.trigger("error", error);
          return cb&&cb(error);
        }
        model.set(doc);
        return cb&&cb(null, model);
      });
      return model;
    },

    toCollection: function(collection, cb){
      var Collection = this.Collection;
      if(typeof collection === "function" && !cb){
        cb = collection, 
        collection = new Collection();
      }
      this.toArray(function(err, doc){
        if(err) {
          collection.trigger("error", err); 
          return cb&&cb(err);
        }
        if(doc.length === 0){
          return cb&&cb(null, collection);}
        var errors = collection.validate(docs);
        if(errors){
          collection.trigger("error", errors);
          return cb&&cb(errors);
        }
        collection.reset(docs);
        return cb&&cb(null, collection);
      });
      return collection;
    }
  });












  var MongoModel = env.AdvancedModel.extend("MongoModel", {
    idAttribute: "_id",

  },

  {
    db: env.db,

    extend: function(name){
      var Model = env.AdvancedModel.extend.apply(this, arguments);
      Model.collectionName = name;
      Model.build = function(cb){
        Model.db.createCollection(name, Model.options || {}, function(err, collection){
          if(err) return cb(err);
          Model.coll       = Model.prototype.coll = collection;
          Model.Collection = MongoCollection.extend(name, 
            {model:    Model     },
            {coll:     collection}
          );
          Model.Cursor = BackboneCursor.extend(name, {
            Model:      Model,
            Collection: Model.Collection
          });



          if(Model.index){
            var index = _.isArray(Model.index)? Model.index : [Model.index];
            var ch = [];
            index.forEach(function(i){ch.push(function(cb){ Model.db.ensureIndex(i, cb); });});
            var chain = env._.chain(ch);
            chain(cb);
          }
          else cb();
        });
      }



      return Model;
    },

    createCursor: function(){
      //function Cursor(db, collection, selector, fields, options) {
      return new this.Cursor(
        this.db,
        this.coll,
        arguments[0],
        arguments[1],
        arguments[2]
      );
    },

    // //Methods returning null
    // insert
    // remove

    // // Methods returning cursor
    // save

    // // Methods returning number
    // update
    // count


    // rename
    // distinct
    // drop
    // findAndModify
    // findAndRemove
    // find
    // findOne
    // createIndex
    // ensureIndex
    // indexInformation
    // dropIndex
    // dropAllIndexes
    // reIndex
    // mapReduce
    // group
    // options
    // isCapped
    // indexExists
    // geoNear
    // geoHaystackSearch
    // indexes
    // aggregate
    // stats


  });

  


  return MongoModel;

}