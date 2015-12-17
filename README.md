https://shstefanov.github.io/infrastructure/

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

