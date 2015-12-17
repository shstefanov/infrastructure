https://shstefanov.github.io/infrastructure/

Changes in 1.1.0
================

Adding command line configuring

    # For boolean values:
    # true
    > node app.js --config.structures.log.options.sys
    # false
    > node app.js --config.structures.log.options.sys false

    #Specific values
    > node app.js --config.mongodb.port=27018 --config.mongodb.host=localhost



