var fs               = require("fs");
var webpack          = require("webpack");
var buildDestination = "";
var configs          = {};

var YAML             = require('yamljs');
require.extensions['.yml'] = function(module, filename) {
  var yaml_string = fs.readFileSync(filename, 'utf8').toString();
  module.exports = YAML.parse(yaml_string);
};

var options = {
  entry:     {},
  plugins:   [],
  resolve:   { alias: {} },
  module: {
    loaders: [],
  }
};

var config = module.exports = {

  buildDestination: function(dest){   buildDestination = dest;                                   return config;  },

  plugin: function(plugin         ) { options.plugins.push(plugin);                              return config;  },
  loader: function(test,   loader ) { options.module.loaders.push({test: test, loader: loader}); return config;  },
  alias:  function(name,   path   ) { options.resolve.alias[name] = path;                        return config;  },
  entry:  function(name,   path   ) { options.entry[name] = path;                                return config;  },
  config: function(name,   path   ) { configs[name] = loadConfig(path);                          return config;  },

  output: function(type, path, options){
    switch(type){
      case "js":
        options.output = { publicPath: '/', filename: buildDestination + path };
        break;

      case "css":
        var ExtractTextPlugin = require("extract-text-webpack-plugin");
        this.plugin( new ExtractTextPlugin( path, options || {}));
        break;
    }
    return config;
  },

  create: function(){
    if( Object.keys(configs).length > 0){
      options.plugins.push(new webpack.DefinePlugin( configs ));
    }

    return options;
  }

};