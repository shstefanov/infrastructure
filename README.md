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
  config/log.json(.js,.yml)

    {
      "info":    true,
      "sys":     true,
      "warning": true,
      "notice":  true,
      "error":   true,
      "debug":   true,
      "morgan":  ":method :url :status :response-time ms - :res[content-length]"
    }
    
  Options for logging. See [morgan log options](https://github.com/expressjs/morgan). 'socketio_log_level' is integer from 0 to 4.

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

    
    env.i.do("data.Profile.update", {
      profile_id: [23, 24, 25],  // profile_id: 24 | profile_id: [24, 25, 26] | profile_id: ["BETWEEN" [24, 26]]
      avatar: "new avatar",
      email: "new updated email"
    }, function(err, profile){
      console.log("RRRR", arguments);
    });

    

    env.i.do("data.Profile.update", {
      avatar: "new avatar",
      email:  "new updated email",

      someValue: 23,
      otherValue: 24

    }, {

      // Template style. @placeholders are from options and not escaped, #placeholders are from pattern and escaped
      // @tableName, @publicFields, @primaryKey are available
      where: "WHERE @primaryKey = #someValue OR @primaryKey = #otherValue",   
      limit: 4,

      order: ["email", "avatar", "asc"]
      // where: {
      //   lastname: ["IN", ["lastName", "testName"]]
      // }
    }, function(err, profile){
      console.log("RRRR", arguments);
    });

  ---



    env.i.do("data.Profile.delete", {
      profile_id: [123, 124, 125],  // profile_id: 24 | profile_id: [24, 25, 26] | profile_id: ["BETWEEN" [24, 26]]
      avatar: ["lalala", "new avatar"],
      email: ["LIKE", "new updated email"]
    }, function(err, profile){
      console.log("RRRR", arguments);
    });

    env.i.do("data.Profile.delete", {
      profile_id: [123, 124, 125],  // profile_id: 24 | profile_id: [24, 25, 26] | profile_id: ["BETWEEN" [24, 26]]
      avatar: ["lalala", "new avatar"],
      email: ["LIKE", "new updated email"]
    }, {
      limit: 3,
      order: "email",
      debug: "alabala"
    }, function(err, profile){
      console.log("RRRR", arguments);
    });

  ---

  ===

    env.i.do("data.Profile.find", 
      { profile_id:       23}, 

        // field_1: ["not in",      5, 9   ],
        // field_2: ["in",        [ 5, 9 ] ],

        // field_3: ["between",     3, 6   ],
        // field_4: ["between",   [ 3, 6 ] ],

        // field_4: [">",   5 ],



      {fields: ["@primaryKey"]}, 
      {limit:      [2, 3]},
      {order:      ["profile_id", "email", "desc"]},

      function(err, profiles){
      
    });