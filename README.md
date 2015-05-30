Config
======
  Config files are in 'config' folder. Infrastructure loads them as one object. Accepted file formats are '.js', '.json' or '.yml'.


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
