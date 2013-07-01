## Usage ##
    npm install infrastructure

in your code:
    
    var config = require("path/to/config/file")
    var infrastructure = require("infrastructure");

    infrastructure(config);  //And your app runs


## The configuration ##

In your config.js file provide the falowing data:
    module.exports = {
      ...your config data here
    }
# Required fields #
    {
      server:{interface:"0.0.0.0", port:3000}, //It's clear
      sessionCookie: "cookie_name",
      mongoStoreSesssionDb: "your_app_name_sessions" // for now it uses mongostore for sessions
    }

# Optional fields #
A static folder
    {
      staticFolder: __dirname+"../static" //or
      staticFolder: [__dirname+"../static", __dirname+"../uploadedImages"] //if you have to assign multiple static folders
    }
Client configuration
    {
      client: {...} //Write what you want, will be accessible in browser's javascript code as 'config' global variable
    }


The bundles
    module.exports = {
      bundles:__dirname+"relative/path/to/your/bundle/file"
    }
And your bundles file:
    module.exports = [ //Array of objects specifying your javascript bundles
      {
        name: "bundle_name",
        load:true, //When true - deletes bundle cache, when false - creates bundle cache, if not exists
        entryPoint: __dirname+"relative/path/to/your/bundle/entry/point" // can be and coffeescript file
        mountPoint: '/bundles/your_bundle_name.js' //This will be the address that you will write in src attribute of script, when loading the bundle in client's browser
      },
      {
        ... next bundles ...
      }
    ];

The routes
Config file
    {
      routes: __dirname+"/path/to/your/routes/folder"
    }
All files in your routes folder will be loaded (except thes with load:false)

Example code for route file
    module.exports = {
      method: "GET", // "POST", "PUT", "DELETE"
      
      //Single route address
      route: "/route_address", 
      // or
      //This page will be rendered as response for any of uris requiested
      route: ["/books", "/books/:id", "/books/:id/page/:page_num"] 

      //The page title
      title:"Your page title", //Can be changed later in callback, if provided

      javascripts:[
        "http://code.jquery.com/ui/1.10.2/jquery-ui.js", //external library
        "/js/jquery_upload/jquery.fileupload.js", //file in your static folder
        "/bundles/my-bundle.js" //bundle mount point
      ],

      styles:[
        "http://cdnserver.com/style.css", //external style
        "/styles/css/my_style.css", //in your static folder
        "/styles/less/my_cool_style.less" //if you are using clientside less compiler
      ],

      //Websocket services that will be active on this page
      //Can be edited later in callback function
      services:[
        "service_name",
        "other_service"
      ],


      //Page config - will extend client configuration in main config file
      //can be modified in calback function
      config:{
        key: "value"
      }


    }
