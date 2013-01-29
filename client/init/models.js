var BaseModel = require("./models/BaseModel");

var m = {};
for(key in __models){
  m[key] = BaseModel.extend({
    name: key,
    defaults: __models[key]
  });

}

module.exports = models;