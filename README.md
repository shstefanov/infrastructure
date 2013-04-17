## Usage ##
    npm install infrastructure

in your code:
    
    var config = require("path/to/config/file")
    var infrastructure = require("infrastructure");

    infrastructure(config);  //And your app runs


## Client side ##

    var router = App.Router.extend({
      //... define Backbone router
    })

    new App.build(router)

# prepare function
    var router = App.Router.extend({
      prepare: function(callback){
        //prepare something
        callback(); // to run the application
      }
    })


