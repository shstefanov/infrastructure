Config
======
  Config files are in 'config' folder. Infrastructure loads them as one object. Accepted file formats are '.js', '.json' or '.yml'.

  ---
  config/app.json(.js,.yml)

    {
      "process_mode" :   "single",
    }
  General application options.

  ---
  config/http.json(.js,.yml)

    {
      "port":    3000,
      "favicon": "public/fav.ico"
    }
  Some http options.

  ---
  config/mongodb.json(.js,.yml)

    {
      "host":            "localhost",
      "port":            27017,
      "username":        "username",
      "password":        "password",
      "db":              "database",
      "auto_reconnect":  true,
      "options":         {}
    }

  See all [options](http://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html)

  ---
  config/mysql.json(.js,.yml)

    {
      "host"     : "localhost",
      "database":  "database",
      "user"     : "username",
      "password" : "password"
    }

  See all [options](https://github.com/felixge/node-mysql/#connection-options)

  ---
  config/postgres.json(.js,.yml)

    {
      "host":            "localhost",
      "port":            5432,
      "database":        "infrastructure",
      "username":        "infrastructure",
      "password":        "infrastructure"
    }

  ---
  config/redis.json(.js,.yml)
    {
      "host":    "127.0.0.1",
      "port":    6379,
      "options": {

      }
    }

  Available options: https://github.com/mranney/node_redis

  ---
  config/controllers.json(.js,.yml)

    {
      "path": "controllers"
    }
  Path to controllers folder (relative to project root dir).

  ---
  config/models.json(.js,.yml)

    {
      "path": "models"
    }

  Path to models folder (relative to project root dir).

  ---
  config/pages.json(.js,.yml)

    {
      "path": "pages"
    }

  Path to pages folder (relative to project root dir).

  ---
  config/data.json(.js,.yml)

    {
      "path": "pages"
    }

  Path to dataLayers folder (relative to project root dir).

  ---


Log
===
    env.do("log.info",    ["subject", "message"], [callback] );
    env.do("log.sys",     ["subject", "message"], [callback] );
    env.do("log.warning", ["subject", "message"], [callback] );
    env.do("log.notice",  ["subject", "message"], [callback] );
    env.do("log.error",   ["subject", "message"], [callback] );
    // Outputs:
    [info]  [2015-05-23 22:18:12][subject].......................... message          
    [sys]   [2015-05-23 22:18:12][subject].......................... message
    [warn]  [2015-05-23 22:18:12][subject].......................... message
    [notice][2015-05-23 22:18:13][subject].......................... message
    [error] [2015-05-23 22:18:13][subject].......................... message







env.data.Profile.find(function(){});
-------------------------------------------------------------------------------------------------------



Queries
=======

MongoDB data object
-------------------

  ---
    env.i.do("data.User.create", {email: 19, name: 24, age: 32}, function(err, user){
      // console.log("????", arguments);
    });

  ---


MongoLayer
==========


    env.i.do("data.User.delete", {email: 19, name: 24, age: 32}, function(err, user){
      // console.log("????", arguments);
    });

  ---

    env.i.do("data.User.find", {email: 19, name: 24, age: 32}, {
      limit:  2,
      skip:   2,
      fields: { email: 1 }
    }, function(err, user){
      // console.log("????", arguments);
    });

  --- 

MysqlLayer and PostgresLayer
==========

  ---
    // Create a record
    env.i.do("data.Blueprint.create", {
      path: "test.path",
      alalala:333,
      name: "Some name",
    }, function(err, record){
      console.log("data.Blueprint.create", record);
    });
  
  ---

    // Find all records
    env.i.do("data.Blueprint.find", function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Find one record by id
    env.i.do("data.Blueprint.find", 5, function(err, record){
      console.log("????", record);
    });

  ---

    // Find multiple records by array of ids
    env.i.do("data.Blueprint.find", [5,6,7], function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Find multiple records by condition
    env.i.do("data.Blueprint.find", {
      name: ["NOT IN", '1434118856493', 1434118849186], // 1434118849186 || [ 1434118849186, 1434118849186 ] || [">=", 1434118849186, 1434118849186 ]
      path: 'test.path'
    }, function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Find multiple records by condition and some options
    env.i.do("data.Blueprint.find", {
      name: [">", 0], // 1434118849186 || [ 1434118849186, 1434118849186 ] || [">=", 1434118849186, 1434118849186 ]
      path: 'test.path'
    }, {
      limit: [3, 3],
      order: ["name", "DESC"]
    }, function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Update record
    env.i.do("data.Blueprint.update", {
      // if primaryKey provided - only one record will be updated
      name: [">", 0], // varriants: 1434118849186 || [ 1434118849186, 1434118849186 ] || [">=", 1434118849186, 1434118849186 ]
      path: 'test.path'
    }, {
      // where: { ... } - if omitted, all records will be updated, otherwise where clause will be generated
      limit: [3, 3],
      order: ["name", "DESC"]
    }, function(err, result){
      console.log("data.Blueprint.update", result);
    });
  
  ---

    // Delete all record
    env.i.do("data.Blueprint.delete", function(err, result){
      console.log("data.Blueprint.delete", result);
    });

    // Delete one record by id
    env.i.do("data.Blueprint.delete", 15, function(err, result){
      console.log("data.Blueprint.delete", result);
    });

    // Delete with where condition
    env.i.do("data.Blueprint.delete", field: value, otrherField: ["Between"], function(err, result){
      console.log("data.Blueprint.delete", result);
    });

RedisLayer
==========

  ---
    // Create record
    env.i.do("data.Cache.create", {alabala: 535353, value: {
      something: 5,
      other: Date.now()
    }}, function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });


  ---

    // Get all records
    env.i.do("data.Cache.find", function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

    // Get record by id
    env.i.do("data.Cache.find", 11, {fields: ["value"]},  function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

    // Get records by array of ids
    env.i.do("data.Cache.find", [10,11,12,13], {fields: ["value"]},  function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

    // Find with 'fields' option
    env.i.do("data.Cache.find", [123,234], {fields: ["field1", "field2"]}, function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

  ---

    
    // Update single record
    env.i.do("data.Cache.update", {field: value, primaryKey: 12}, function(err, result){
      console.log("success: delete", arguments);
    });

    // Update multiple records
    env.i.do("data.Cache.update", [
     {field: value, primaryKey: 12},
     {field: value, primaryKey: 13},
     {field: value, primaryKey: 14},
     {field: value, primaryKey: 15},
    ], function(err, result){
      console.log("success: update", arguments);
    });

    // Delete all records
    env.i.do("data.Cache.update", null, function(err, result){
      console.log("success: update", arguments);
    });

  ---

    // Delete single record
    env.i.do("data.Cache.delete", 11, function(err, result){
      console.log("success: delete", arguments);
    });

    // Delete multiple records
    env.i.do("data.Cache.delete", [11, 12, 13], function(err, result){
      console.log("success: delete", arguments);
    });

    // Delete all records
    env.i.do("data.Cache.delete", null, function(err, result){
      console.log("success: delete", arguments);
    });

  ---

