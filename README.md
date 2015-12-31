https://shstefanov.github.io/infrastructure/

Changes in 1.2.0
================
  Adding config.only = [ ...structure_names ] in test mode
  Adding test_env.client(url, options, function(err, window){}) for loading and running clientside code with jsdom

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