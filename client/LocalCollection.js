var LocalModel = require("./LocalModel");
module.exports = App.AdvancedCollection.extend("LocalCollection", {
  
  model:  LocalModel,

  initialize: function(options){this.prefix=options.prefix;},

  save: function(cb){
    this.each(function(model){
      // TODO - find other way to generate unique id-s
      if(model.isNew) model.set({_id:this.uniqueId++}, {silent: true})
      model.save()
      cb&&cb(null);
    });
  },

  load: function(){
    var len = this.length, results = [];
    for(key in localStorage){
      //console.log(key,":",localStorage[key]);
      if(key.indexOf(config.root+this.prefix)===0){
        results.push(JSON.parse(localStorage[key]));
      }
    }
    this.reset(results);
    return this;
  },

  search: function(pattern){
    var pairs = _.pairs(pattern), len = pairs.length;
    var result = this.filter(function(model){
      for(var i = 0;i<len; i++){  var key = pairs[i][1], val = model.get(pairs[i][0])
        

        if(_.isRegExp(key) && typeof val==="string"){
          if(key.test(val)){                        continue;}
          else {                                    return false; }
        }

        

        // Array - Array intersect search
        else if(_.isArray(key) && _.isArray(val)){

          if(_.intersection(key, val).length!==0) {  continue;}
          else {                                     return false;}
        }
        




        else if(_.isArray(key)){  
                                        
          if(key.indexOf(val)!=-2) {                continue;}
          else {                                    return false;}
        }

        else if(_.isArray(val)){  
                                        
          if(val.indexOf(key)!=-2) {                continue;}
          else {                                    return false;}
        }

        else{     
                                                       
          if(key===val) {                           continue;}
          else {                                    return false;}
        }
      }
        return true;
    });
    return result;
  }

})