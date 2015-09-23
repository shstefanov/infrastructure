var assert = require("assert");

var WebsocketApp   = require("../../lib/WebsocketApp.js");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe("WebsocketApp" + currentFileMark, function(){

  var testEnv = {
    reset: function(){
      testEnv = {
        do_s: [],
        reset: testEnv.reset,
        stops: [],
        config: {
          websocket: {}
        },
        engines: {
          io: function(){
            return {
              on: function(ev, hndl){},
              listen: function(port){}
            }
          }
        },
        i: {
          do: function(){
            testEnv.do_s.push(Array.prototype.slice.call(arguments));
          }
        } 
      };
    }
  }

  function TestSessionModel(data){
    this.data = data;
  };
  TestSessionModel.prototype.fetch = function(options){ setTimeout(options.success,10);};
  TestSessionModel.prototype.on    = function(){};

  function TestSessionsCollection(data){
    
  };
  TestSessionsCollection.prototype.add     = function(){};
  TestSessionsCollection.prototype.get     = function(){};
  TestSessionsCollection.prototype.getBy   = function(){};
  TestSessionsCollection.prototype.indexBy = function(){};

  var TestWebsocketApp = WebsocketApp.extend("TestWebsocketApp", {

    SessionModel:       TestSessionModel,
    SessionsCollection: TestSessionsCollection,

    env: testEnv,
    tokens: {},

    path: "/apps/app_name",
    port: 4001,
    name: "app_name",
    protocol: "ws://",
    host:    "localhost",
    transports: ["websocket", "xhr-polling"],

    tokenParam: "token",
  });

  it("Instantiates WebsocketApp", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    assert.deepEqual(testEnv.do_s, [[ 
      'log.sys',                         
      'websocket server',                
      'app_name: [ws://localhost:4001]' ]]);
    done();
  });

  it("Builds right websocket config and deals with the token", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    websocketApp.getWebsocketConfig("12312313", function(err, config){
      assert.equal(err, null);
      assert.deepEqual(config, { protocol: 'ws://',                         
        path: '/apps/app_name',                    
        transports: [ 'websocket', 'xhr-polling' ],
        host: 'localhost',                         
        port: 4001,                                
        name: 'app_name',                          
        query: 'token=app_name1' 
      });
      var tokenObj = {};
      tokenObj[config.query.split("=").pop()] = "12312313";
      assert.deepEqual(tokenObj, websocketApp.tokens);
      done();
    });
  });

  it("Handle request without cookie", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    websocketApp.getWebsocketConfig("767868678", function(err, config){
      websocketApp.handleRequest({
        headers: {}
      }, function(err, result){
        assert.equal(err, "Authorization failed");
        done();
      });
    });
  });

  it("Handle request without query params", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    websocketApp.getWebsocketConfig("767868678", function(err, config){
      websocketApp.handleRequest({
        // _query: {
        //   token: "123123123"
        // },
        headers: {
          cookie: "connect.sid=s%3A_ikYGdWyOQlPjrA8rMTBy9q2ZAsvlA9d.eTsTNl1lrz%2FEroZmGGa3UU1KEhHhVPQSrTutVtvOuFA"
        }
      }, function(err, result){
        assert.equal(err, "Authorization failed");
        done();
      });
      
    });
  });

  it("Handle request without needed token param", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    websocketApp.getWebsocketConfig("767868678", function(err, config){
      websocketApp.handleRequest({
        _query: {
          invalid_token_param: "123123123"
        },
        headers: {
          cookie: "connect.sid=s%3A_ikYGdWyOQlPjrA8rMTBy9q2ZAsvlA9d.eTsTNl1lrz%2FEroZmGGa3UU1KEhHhVPQSrTutVtvOuFA"
        }
      }, function(err, result){
        assert.equal(err, "Authorization failed");
        done();
      });
      
    });
  });

  it("Handle request with invalid token", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    websocketApp.getWebsocketConfig("767868678", function(err, config){
      websocketApp.handleRequest({
        _query: {
          token: "123123123"
        },
        headers: {
          cookie: "connect.sid=s%3A_ikYGdWyOQlPjrA8rMTBy9q2ZAsvlA9d.eTsTNl1lrz%2FEroZmGGa3UU1KEhHhVPQSrTutVtvOuFA"
        }
      }, function(err, result){
        assert.equal(err, "Authorization failed");
        done();
      });
      
    });
  });

  it("Handle request with valid token", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    websocketApp.getWebsocketConfig("767868678", function(err, config){
      var token = config.query.split("=").pop();
      websocketApp.handleRequest({
        _query: { token: token },
        headers: {
          cookie: "connect.sid=s%3A_ikYGdWyOQlPjrA8rMTBy9q2ZAsvlA9d.eTsTNl1lrz%2FEroZmGGa3UU1KEhHhVPQSrTutVtvOuFA"
        }
      }, function(err, result){
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      });
      
    });
  });

});
