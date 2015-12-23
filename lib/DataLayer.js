var _ = require("underscore");
var EventedClass = require("./EventedClass");

module.exports = EventedClass.extend("DataLayer", {

  primaryKey:     "_id",

  constructor: function(env, structure_name, name){
    var Prototype = this.constructor;
    this.env = env;
    Prototype.setupDatabase(this, env, name);
    EventedClass.apply(this, arguments);
  }

}, {
  baseMethods: _.methods(EventedClass.prototype),
  setMethods: function(parent, child){
    child.methods = _.unique(
      _.difference(
        _.methods(parent).concat(_.methods(child)),
        this.baseMethods
      )
    );
  },

  handleSeedOptions: function(ctx, cb, source){
    if(!ctx.config.options) return cb(null, ctx);
    var seed = ctx.config.options.seed;
    if(seed === true || (seed && seed[ctx.name])){
      var seed_source;
      function createRecords(data, parsed){
        if(!parsed && ctx.Prototype.parseSeed){
          return ctx.Prototype.parseSeed(data, function(err, parsed_data){
            if(err) return cb(err);
            createRecords(parsed_data, true );
          });
        }
        if(!Array.isArray(data)) data = [data];
        ctx.env.helpers.amap(data, function(obj, cb){
          ctx.instance.create(obj, {}, cb);
        }, function(err, objects){
          if(err) return cb(err);
          ctx.env.i.do("log.sys", "DataLayer:seed", "Seeded "+data.length+" models for data layer \"" + ctx.name + "\"" );
          cb(null, ctx);
        });

      }
      if(source) seed_source = source;
      else if(seed === true || seed[ctx.name] === true){
        // Try to find seed from Layer properties
        seed_source = ctx.instance.seed;
      }
      else seed_source = seed[ctx.name];
      if(!seed_source) return cb(null, ctx);
      if(typeof seed_source === "string"){
        if(seed_source.match(/^https?:\/\//)){  // match url
          var request = require("request");
          return request.get(seed_source, function(err, res, body){
            if(res.statusCode !== 200) return cb("Error "+res.statusCode +" ("+seed_source+")");
            var data, error, parsed = false;
            if(ctx.Prototype.parseSeed){
              ctx.Prototype.parseSeed(body, function(err, _data){
                if(err) {
                  error = true;
                  return cb(err);
                }
                data = _data, parsed = true;
              });
            }
            else{
              try{
                data = JSON.parse(body);
              }
              catch(err){
                return cb("Can't parse seed source "+" ("+seed_source+")" );
              }
            }
            if(!error) createRecords(data, parsed); 
          });
        }
        else if(seed_source.indexOf("/")!==-1){    // match fs path
          var path = require("path"), fs = require("fs");
          seed_source = path.join(process.cwd(), seed_source);
          if(fs.existsSync(seed_source)){
            try{ 
              var seed_data = require(seed_source);
              if(typeof seed_data === "function") return this.handleSeedOptions(ctx, cb, seed_data);
              if(ctx.Prototype.parseSeed){
                return ctx.Prototype.parseSeed(seed_data, function(err, parsed_data){
                  if(err) return cb(err);
                  createRecords(seed_data, true);
                });
              }
              else{
                return createRecords(seed_data); 
              }
            }
            catch(err){ return cb(err); }
          }
          else return cb("Error - can't find file ("+seed_source+")");
        }
        else{    // match config path
          var seed_data = ctx.env.helpers.resolve(ctx.config, seed_source);
          if(typeof seed_data === "string") return this.handleSeedOptions(ctx, cb, seed_data);
          else return createRecords(seed_data);
        }
        
      }
      else if(typeof seed_source === "function"){
        return seed_source.call(ctx.instance, function(err, models){
          if(err) return cb(err);
          createRecords(models);
        });
      }
      else if(Array.isArray(seed_source)) return createRecords(seed_source);
      else return createRecords([seed_source]);
    }
    else cb(null, ctx);
  }

});
