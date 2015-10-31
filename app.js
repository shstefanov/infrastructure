var infrastructure = require("./index");

infrastructure({
  "mode":              "development",
  "process_mode":      "cluster",
  "rootDir":           __dirname,

  "structures": {
    "log": {
      "engines": ["log"],
      "options": {"sys": true, "build": true}
    },
    "pages": {
      "path":       "app/pages",
      "engines":    [ "infrastructure-server-engine-express"            ],
      "loaders":    [ "infrastructure-server-pages-express/loader"      ],
      "libs": {     "Page" : "infrastructure-server-pages-express/Page" },
      "config": {
        "views":{ 
          "path": "app/templates", 
          "view_engine": "jade", 
          "cache": false 
        },
        "http": { 
          "port": 3000, 
          "static": {
            "/infrastructure/public": "public"
          }
        }
      }
    },

    "webpack": {
      "path": ["app/client", "*/*.webpack.js"],
      "engines": ["infrastructure-webpack/engine"],
      "loaders": ["infrastructure-webpack/loader"],
      "libs": {
        "Bundler": "infrastructure-webpack/Bundler"
      },

      "config": {
        "webpack": {
          "watch":  true,
          "buildDestination": "./public",
          "publicPath": "/infrastructure/"
        }
      }
    }

  },

  "pages": {
    "infrastructure": {
      "root": "/infrastructure",
      "template": "infrastructure",
      "GET *": ["webpack.infrastructure.getAssets"]
    }
  },

  "client": {
    "infrastructure": {
      "name": "infrastructure",
      "entry": ["./infrastructure.index.js", "./infrastructure.index.less"],
      "output": "infrastructure.bundle.js",
      "styleFilename": "infrastructure.bundle.css",
      "watch": true,
      "chunks": {
        "vendor": {
          "output": "infrastructure.vendor.js",
          "modules": ["underscore", "backbone", "ractive/ractive.runtime.js"]
        }
      },

      "loaders": [
        // {"test": "rainbow.js", "loader": "imports?window=App"},
        // {"test": "Rainbow\\/js\\/language\\/javascript.js", "loader": "imports?App=App&Rainbow=App['Rainbow']" }
      ],

      // "config": {
      //   "SOME_FUNC": function(){ console.log("WHOAAAAAA!!!") },
      // },

      "alias": {
        
      },

      "fileLoaders": {
        "images": {
          "extensions": ["gif", "jpe?g", "png", "svg", "bmp" ],
          "inlineLimit": 1,
          "name": "images/[hash].[ext]"
        },
        "fonts": {
          "extensions": ["woff", "eot", "ttf", "woff2" ],
          "inlineLimit": 1,
          "name": "fonts/[hash].[ext]"
        }
      },
      "progress": true,
      "scrapeRactiveTemplatesImages": true,
    }
  }




}, function(err, env){
  if(err) throw err;
});
