## Usage ##
    npm install infrastructure

in your code:
    
    var config = require("path/to/config/file")
    var infrastructure = require("infrastructure");

    infrastructure(config);  //And your app runs

## Config file - the core of the app ##

    module.exports = {

      server : {
        interface: "0.0.0.0",
        port: "3000"
      },

      //nodejs sequilize options - see http://sequelizejs.com/ for more
      mysql:{ 
        user: "username",
        password: "password",
        database: "database_name",
        //+ all other options from http://sequelizejs.com/
        host: "localhost",
        port: "3306",

        sync: { force: true },
        syncOnAssociation: true,
        define: {
          underscored: true,
          freezeTableName: false,
          syncOnAssociation: true,
          charset: 'utf8',
          collate: 'utf8_general_ci',
          //classMethods: {method1: function() {}},
          //instanceMethods: {method2: function() {}},
          timestamps: true
        }
      },

      clientConfig:{
        //Any config data, that will be accessible in app.config in your browser code
      },

      //Path to file with definition of your models - see https://github.com/dresende/node-orm2 for more
      models:__dirname+"/../models/index.js",

      //Path to file with your seeds - look below for more
      seed:__dirname+"/../models/seed.js",

      //Path to folder, that contains your routes definitions - see below how to define a route
      routesFolder: __dirname+"/../routes",

      //Path to folder, dhat contains your bundles definitions - see below how to define a bundle
      bundlesFolder:__dirname+"/../bundles",

      //Raw files to be included when requiered
      //The content will be parsed and will be returned as string variable
      bundlesRawFiles: [".jade"],
      
      //Bundles options
      bundlesOptions:{
        cache:false,
        watch:true //rebuilds bundles when any file is changed
      },

      //Path to folder, dhat contains your socket.io services definitions - see below how to define a service
      socketIoServicesFolder: __dirname+"/../services", 
      
      //Folder with static content
      staticFolder: __dirname+"/../static", 

      //Folder that contains your css - it's less css
      stylesFolder: __dirname+"/../styles",

      //Original i18next options - see https://github.com/jamuhl/i18next-node for more
      i18next: { 
        lng: "dev",
        fallbackLng: 'dev',
        cookieName: 'lang',
        detectLngQS: 'lang', // querystring parameter (?lang=en-US)
        ns: 'translation', // Name space - will load locales/dev/resource.json' (Default namespace is 'translation'.)
        resGetPath: __dirname+"/../static/locales/__lng__/__ns__.json",
        resSetPath: __dirname+"/../static/locales/__lng__/__ns__.json",
        resChangePath: __dirname+"/../static/locales/__lng__/__ns__.json",
        resRemovePath: __dirname+"/../static/locales/__lng__/__ns__.json",
        saveMissing: true,
        debug: true,
        detectLngFromPath: 0, // default false
      },

      //Formidable original options - see https://github.com/felixge/node-formidable for more
      fileUploadOptions: {
        uploadRoute: "/upload",
        formEncoding: "utf-8",
        fileUploadDir: __dirname+"/../uploads",
        keepExtensions: true, 
        maxFieldsSize: 2 * 1024 * 1024, //Limits the amount of memory a field (not file) can allocate in bytes.
        hash: false, // false, 'sha1' or 'md5'
      },


      //Thses libraryes will be loaded as script src in all tour pages
      defaultStaticScripts: [ 
        '/socket.io/socket.io.js', //Express feature
        '/js/your_js_lib.js',
      ],

      //Styles that will be loade in all your pages - file in you styles folder
      defaultStyleSheets:["your_less_file.less"],

      //Sessions options
      sessionSecretCookie: "session-cookie-name",

      //It uses mongodb for storing the sessions information
      mongoStoreSesssionDb: "pan-varna-sessions",

      //Info -set your custom info here
      version: require(__dirname+"/../package.json").version

    };

## Bundles ##
Bundle loader will load all .js files in your bundles folder and will build a javascript bundle from each.

    module.exports = {
      bundleName:"app", 
      entryPoint:  __dirname+"/../client/app.js", //Path to entrypoint
      mountPoint : "/app.js", //Mountpoint which browser should load as javascript src

      //Individual bundle options that will overwrite the options from your config - for easy development
      cache: false,
      watch: true,

      //Callback that will be executes instead of default app.use(bundler)
      callback: function(bundler, app){
        //Some of possible actions:
        //bundler.addEntry(path_to_file);
        //bundler.register(".file_extencion", function(body, file){...});
        //bundler.require(path_to_file)
        //bundler.prepend("javascript code (as string) that will be placed on top of your bundle and will be accessible from all requireded files");
        //For more, see browserify v1.17.3 that is used
        // Do something with your bundler and...
        app.use(bundler);
      }
    };

## Routes ##
The routes, as with bundles, will be loaded automaticly from your routes folder.

    module.exports = {
      route:"/",  //Regex can be provided, also '/route_name/:id'
      method: "get",
      title:"Some title",

      //Javascripts that will be loaded from your static directory before bundles
      libs:[ 
        "/js/static-lib.js",
        "/js/other-static-lib.js"
      ],

      //Write here which bundles will load your page (mountpoints)
      bundles:["/app.js"],

      //Write here which styles will load your page
      styleSheets:[
        "style.less"
      ],

      //This config will extend config.clientConfig. Duplicating keys will be overriden
      config: {key:"value"},

      callback: function(page, app, render){
        //You can change som properties dinamicly if you wish.
        page.bundles = ["/other_bundle.js"];
        render(page);

        //or you can reach request and response objects and use them directly as express req, res and next arguments
        console.log(page.req.params);
        page.res.send("some custom response");
        page.next();
      }
    };




## Service definition and usage ##
Asuming the file name is my_service.js
The service name will be the name of file, just without the .js extencion

    module.exports = {
      auth:function(data){ //Check authorization here
        //Accessible objects:
        //this.socket
        //this.app
        //this.session
        //this.models - sequilize orm models

        //this.emit(data) - function 
        //this.next(data)

        //If you want to return error, set data.meta = "error" and data.body = {field:"detected error"} or {error:"some error"}

        //If you want to return success, set data.meta = "success" and data.body = object_to_be_returned

        //It also have this.service_index() for internal use
      },

      custom_method: function(data){
        //Do your staff here and return the data to the client
        this.emit({
          action:"custom_method", 
          body:your_data, 
          meta:"success/error or custom",
          reqId:data.reqId
        });
      }
    }

Clientside usage of the service will look like:

    app.services.my_service.custom_method(data); //Sending data without callback

    app.services.my_service.custom_method(data, function(err, data){ //With callback
      //Do your staff with your data here
    });

    app.services.my_service.custom_method(function(err, data){ //Passing only function will set eventlistener - client can listen if server streams some data for this action
      //Do your staff with your data here
    });

## Models ##
In http://sequelizejs.com/ documentation for models definition. Use types argument instead Sequilize.types, because this function will be called twice - once for seeding and once for building clientside models
    module.exports = function(sq, types, seeds, cb){
      var Settings = sq.define('settings', {
        key:                  { type: types.STRING, unique: true},
        value:                        types.STRING,
        description:                  types.STRING
      });

      var User = sq.define('user', {
        username:               type: types.STRING, unique: true},
        passwordHash:                 types.STRING,
        email:                        types.STRING
      });

      //Callback will return app, so you can do this:
      var app = cb();

      app.models = { //sequilize models will be accessible from any part of your app
        Settings: Settings
      }; 
    };

