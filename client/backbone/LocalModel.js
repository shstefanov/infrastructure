var root = config.root;
module.exports = App.Model.extend("LocalModel", {
  idAttribute: "_id",
  
  save: function(){
    if(this.isNew) this.set(this.setId())
    localStorage[root+this.collection.prefix+"/"+this.id] = JSON.stringify(this.toJSON());
  },
  
  load: function(id, options){
    var data = localStorage[root+this.collection.prefix+"/"+this.id];
    data && this.set(JSON.parse(data), options);
  },

  getId: function(){
    var id = localStorage.uniqueID
    if(id) id = parseInt(localStorage.uniqueID);
    else localStorage.uniqueID = id = 0;
    return id
  },

  setId: function(){
    var id = this.getId();
    id++;
    localStorage.uniqueID = id;
    return id;
  }



});