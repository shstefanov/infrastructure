var BaseCollection;
var Collection = BaseCollection = require("./Collection");
var _          = require("underscore")

module.exports = Collection.extend("ExtendedCollection", {

  constructor: function(models, options){
    this._index        = {};
    this._groups       = {};
    this._eventMarkers = {};

    Collection.apply(this, arguments);

    var index          = {};
    var groups         = {};

    if(this.index)               _.extend(index, this.index);
    if(options && options.index) _.extend(index, options.index);
    if(this.group)               _.extend(groups, this.group);
    if(options && options.group) _.extend(groups, options.group);
    this.indexBy(index).groupBy(groups);
  },

  fire: function(event){
    if(_.isObject(event)){
      for(var key in event){
        var args = ["trigger"];
        args = args.concat(Array.isString(event)? event[key] : [event[key]]);
        this.invoke.apply(this, args);
      }
      return this;
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift("trigger");
    this.invoke.apply(this, args);
    return this;
  },

  // iterator - string, function or array of strings that compile index from many attributes and separators
  indexBy: function(name, iterator){
    if(_.isObject(name)){
      for(var key in name) {
        this.indexBy(key, name[key]);
      }
      return this;
    }
    var itr;
    var index = this._index[name] = {};
    if(typeof iterator == "undefined") iterator = name;

    if(typeof iterator == "string") 
      itr = function(model){return model.get(iterator);};
    else if(Array.isArray(iterator))
      itr = function(model){
        return iterator.map(function(stuff){
          return model.get(stuff).toString();
        }).join("_");
      };
    else itr = iterator;
    var self = this;

    var addModel = function(model){
      var index = itr(model);
      this[index] = model;
      model.on("change", function(model){
        var newIndex = itr(model);
        if(newIndex !== index){
          delete this[index];
          this[newIndex] = model;
          index = newIndex;
        }
      }, this);
    };

    var removeModel =  function(model){
      model.off(null, null, this); 
      delete this[itr(model)];
    };

    this
    .on("add",   addModel,    index)
    .on("remove",removeModel, index)
    .on("reset", function(){
      options.previousModels.forEach(removeModel);
      self.each(addModel, this)
    }, index );
    .each(_.bind(addModel,    index));
    return this;
  },

  dropIndex: function(name){
    if(typeof this._index[name] === "undefined") return this;
    var self = this;
    this.each(function(model){model.off(null, null, self._index[name]);});
    this.off(null, null, this._index[name]);
    delete this._index[name];
    return this;
  },

  // iterator - string, function or array of strings that compile index from many attributes and separators
  // also, iterator can return array of strings to add model to multiple groups
  groupBy: function(name, iterator, Collection){
    Collection = Collection || BaseCollection;
    
    if(_.isObject(name)){
      for(var key in name) {
        this.groupBy(key, name[key]);
      }
      return this;
    }
    var itr;

    if(typeof iterator == "string") 
      itr = function(model){return model.get(iterator);};
    else itr = iterator;
    var self = this;

    var groups = this._groups[name] = {};

    var add = function(index, model){
      if(!groups[index]) {
        groups[index] = new Collection();
        groups[index].add(model);
        self.trigger("group:"+name, index, groups[index]);
      }
      else{
        groups[index].add(model);        
      }
    };

    var remove = function(index, model){
      groups[index].remove(model);
      if(groups[index].length === 0) {
        groups[index].trigger("empty");
        self.trigger("dropGroup:"+name, index);
        delete groups[index];
      }
    };

    var addModel = function(model){
      var group = itr(model);
      if(Array.isArray(group)){
        group.forEach(function(gr){ add(gr, model); });
      }
      else add(group, model);

      model.on("change", function(model){
        var newIndex = itr(model);
        if(!_.isEqual(newIndex, group)){
          if(Array.isArray(group) && Array.isArray(newIndex)){
            var added   = _.difference(  newIndex, group    );
            var removed = _.difference(  group,   newIndex  );
            added   .forEach(function(idx){add   (idx, model);});
            removed .forEach(function(idx){remove(idx, model);});
          }
          else{
            remove  (group,    model);
            add     (newIndex, model);
          }
          group = newIndex;
        }
      }, this);
    };

    var removeModel =  function(model){
      model.off(null, null, this);
      var idx = itr(model);
      if(Array.isArray(idx)) idx.forEach(function(i){remove(i, model);});
      else remove(idx, model);
    };

    this
    .on("add",      addModel,    groups)
    .on("remove",   removeModel, groups)
    .on("reset", function(collection, options){
      options.previousModels.forEach(removeModel);
      self.each(addModel, this);
    }, groups );
    .each(_.bind(addModel, groups));
    return this;
  },

  getGroup: function(name, index){
    return this._groups[name] ? this._groups[name][index] : undefined;
  },

  dropGroup: function(name){
    var self = this;
    var groups = this._groups[name];
    this.each(function(model){model.off(null, null, groups);});
    this
    .off("add",    null, groups)
    .off("remove", null, groups)
    delete this._groups[name];
    return this;
  },

  bindAll: function(evt, method, ctx){
    var marker = this._eventMarkers[evt] = {};
    var bind   = function(model){ model.on (evt, method, ctx || model) };
    var unbind = function(model){ model.off(evt, method, ctx || model) };
    this.on("add", bind, marker).on("remove", unbind, marker);
    this.each(bind);
    return this;
  },

  unbindAll: function(evt, method, ctx){
    var marker = this._eventMarkers[evt];
    this
    .off("add",    method || null, marker)
    .off("remove", method || null, marker);
    this.each(function(model){model.off(evt, method || null, ctx || model)});
    delete this._eventMarkers[evt];
    return this;
  },

  getBy: function(arg1, arg2){
    return this._index[arg1]?this._index[arg1][arg2]:undefined;
  }

});
