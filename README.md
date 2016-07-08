https://shstefanov.github.io/infrastructure/

Changes in 1.4.0
================

  Added config.callback_timeout option (defaults to 60000 milliseconds)
  Added config.callback_check_timeout_interval (defaults to 5000 milliseconds)

  Added lib/ExpireStore.js
```javascript

var ExpireStore = require("infrastructure/lib/ExpireStore");
var store = new ExpireStore(5000);
store.set("some_unique_key", "Some value");
store.on("expire", function(key, value){
  // Do something with expired things
});
setTimeout(function(){
  store.get("some_unique_key"); //undefined
}, 6000);
store.size(); // count elements in store
store.has("key"); //true|false
store.delete("key"); // remove element from store if key exists
var value = store.pull("key") return value and remove element from store
store.expire("key"); // force element expiration
store.check(); // Validates all elements and drops expired
store.start(2000); // Start checking every x milliseconds
store.stop();      // Stops checking interval

```

Changes in 1.3.0
================

  Support .hson file format in config ( https://github.com/timjansen/hanson )

  Adding 'patch' to config root (or mode root)
```json
{
  "structures.pages.config.http.port": 3000,
  "structures.models.config.mongodb.host": "example.com"

}
```
  Fixing missing repl close on shutdown
  Try to return better error message on catch in helpers.chain

Adding 
```javascript
env.i.do("master.keep", "key", value); // keeps some data (needed to restore target data on hot reload)
env.i.do("master.pull", "key", function(err, data)); // pulls the data from the cache
```


Changes in 1.2.0
================
  Adding config.only = [ ...structure_names ] in test mode
  Adding test_env.client(url, options, function(err, window){}) for loading and running clientside code with jsdom
  Adding "callable" as alternative to "methods" whitelist
  Adding test_env.client(url, function(err, window)) for testing clientside code
  Adding restart("structure_name") in --repl on master process
  Adding config.only = ["structure1_name", "structure2_name"] in test mode
  Cli options can be passed via config.options
  Instances prototypes can point to resolvable module

  Fixing config modes issues

config.structures

Changes in 1.1.0
================

Adding command line options. For parsing is used "minimist".
"config" will be detached from options and will be used to update main config tree.

    # For boolean values:
    # true
    > node app.js --config.structures.log.options.sys
    # false
    > node app.js --config.structures.log.options.sys false

    #Specific values
    > node app.js --config.mongodb.port=27018 --config.mongodb.host=example.com

The rest of options will be attached to config.options


Adding REPL console, available with --repl option. It starts the console in master process and provides env and config variables.
If used as --repl=structure_name in cluster process_mode, it will launch the console in the child process that handles the structure.


Fixed spawning on exit in cluster process mode.

Seed option for DataLayers

    --seed or --seed.ModelName

This will set seed option to string (url, fs path, related to project root or dot notated config resolve path);

    --seed.ModelName=http:eample.com/resource
    --seed.ModelName=./seeds/ModelsData.json
    --seed.ModelName=seeds.ModelsData

The last will be resolved from config tree. It can point to object, array or string that will be proceeded too.

It also can point to function (DataLayer instance seed property to be function). 

    function seed(cb){
      // do something async
      cb(err, [ /* models here */ ]);
    }

Also, for "http" seeds, if parseSeed provided in DataLayer static properties, it will be used to parse the response.

    parseSeed: function(body, cb){
      // scrape response
      cb(null, [ /* your models here */ ])
    }

Otherwise, parseSeed will be called with resoled data (you may want to make some of properties dates, objectID-s or something else)

    parseSeed: function(resolved_data, cb){
      // change the data
      cb(null, [ /* changed models here */ ])
    }