
var mixins = require("./lib/mixins");
module.exports = function(env, cb){
  mixins.apply(env);
  
  var proxy = function(cb){
    env._.debug("", 2, "green", "PROXY IN INIT");
    cb(null);
  };
  
  env._.chain([
    require("./init/tools"        ),
    require("./init/database"     ),
    require("./init/models"       ),
    require("./init/socket"       ),
    require("./init/http"         ),
    require("./init/bundles"      ),
    require("./init/controllers"  ),
    require("./init/pages"        )
  ])(function(err){ cb(err, env)  }, env);

  if(env.config.redis){
    var redisconf = env.config.redis;






    var redis = require("redis");

    var getRedis = function(host,port,password){
      var client = redis.createClient(
        port, 
        host
      );
      client.auth(password);
      return client;
    };

    var getPair = function(host,port,password){
      return {
        publisher: getRedis(host, port, password),
        subscriber: getRedis(host, port, password)
      }
    }

    var msg_count = 0;

    var conn = getPair(redisconf.host, redisconf.port, redisconf.password)
    //var publisher  = getRedis(redisconf.host, redisconf.port, redisconf.password)


     conn.subscriber.on("subscribe", function (channel, count) {
        conn.publisher.publish("a nice channel", "I am sending a message.");
        conn.publisher.publish("a nice channel", "I am sending a second message.");
        conn.publisher.publish("a nice channel", "I am sending my last message.");
    });

    conn.subscriber.on("message", function (channel, message) {
        console.log("subscriber channel " + channel + ": " + message);
        msg_count += 1;
        if (msg_count === 3) {
            conn.subscriber.unsubscribe();
            conn.subscriber.end();
            conn.publisher.end();
        }
    });

    conn.subscriber.incr("did a thing");
    conn.subscriber.subscribe("a nice channel");





    // client.on("error", function (err) {
    //     console.log("Redis error " + err);
    // });

    // client.set("string key", "string val", redis.print);
    // client.hset("hash key", "hashtest 1", "some value", redis.print);
    // client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
    // client.hkeys("hash key", function (err, replies) {
    //     console.log(replies.length + " replies:");
    //     replies.forEach(function (reply, i) {
    //         console.log("    " + i + ": " + reply);
    //     });
    //     client.quit();
    // });



  }




}; 
