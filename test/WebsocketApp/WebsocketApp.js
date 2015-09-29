var assert = require("assert");

var WebsocketApp   = require("../../lib/WebsocketApp.js");
var helpers        = require("../../lib/helpers.js");

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

    options: {
      path: "/apps/app_name",
      port: 4001,
      name: "app_name",
      protocol: "ws://",
      host:    "localhost",
      transports: ["websocket", "xhr-polling"],
      tokenParam: "token",      
    },

    generateAppToken: function(){
      return "123456"
    }
  });

  it("Instantiates WebsocketApp", function(done){
    testEnv.reset();
    var websocketApp = new TestWebsocketApp(testEnv);
    assert.deepEqual(testEnv.do_s, [
      ['log.sys', 'websocket server', 'app_name: [ws://localhost:4001]' ]
    ]);
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
        query: 'token=123456'
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

  it("Builds socket event handlers", function(done){
    testEnv.reset();
    var calls   = [];
    var TestApp = TestWebsocketApp.extend("TestApp", {
      listenSocket: {
        event_1: function(){calls.push(["event_1"].concat(arguments));},
        event_2: function(){calls.push(["event_2"].concat(arguments));},
      }
    });
    var websocketApp = new TestApp(testEnv);
    assert.equal(Object.keys(websocketApp.__parsedSocketEvents).length, 2);
    assert.deepEqual(Object.keys(websocketApp.__parsedSocketEvents), [ "event_1", "event_2" ]);
    done();
  });

  it("Emits 'init' on bindSocketEvents", function(done){
    testEnv.reset();
    var calls   = [];
    var TestApp = TestWebsocketApp.extend("TestApp", {
      listenSocket: {
        event_1: function(){calls.push(["event_1"].concat(arguments));},
        event_2: function(){calls.push(["event_2"].concat(arguments));},
      }
    });
    var websocketApp = new TestApp(testEnv);

    var test_socket = {

      emits: [],
      emit: function(){ this.emits.push(arguments); },

      
      handlers: {},
      trigger: function(ev){ this[ev].apply(this, Array.prototype.slice.call(arguments, 1)); },
      on:      function(ev, handler){  this[ev] = handler; }

    };

    var cb_args;
    websocketApp.bindSocketEvents(test_socket);
    assert.deepEqual(test_socket.emits.map(function(args){ return Array.prototype.slice.call(args);}), [
      [ "init", { "methods": [ "event_1", "event_2" ] } ]
    ]);
    done();
  });

  it("Handle simple websocket events", function(done){
    testEnv.reset();
    var calls   = [];
    var TestApp = TestWebsocketApp.extend("TestApp", {
      listenSocket: {
        event_1: function(){calls.push(["event_1"].concat(arguments)); Array.prototype.slice.call(arguments).pop()()},
        event_2: function(){calls.push(["event_2"].concat(arguments)); Array.prototype.slice.call(arguments).pop()()},
        event_3: function(){calls.push(["event_3"].concat(arguments)); Array.prototype.slice.call(arguments).pop()()},
      }
    });
    var websocketApp = new TestApp(testEnv);

    var test_socket = {

      emits: [],
      emit: function(){ this.emits.push(arguments); },

      
      handlers: {},
      trigger: function(ev){ this.handlers[ev].apply(this, Array.prototype.slice.call(arguments, 1)); },
      on:      function(ev, handler){  this.handlers[ev] = handler; }

    };

    var cb_args;
    websocketApp.bindSocketEvents(test_socket);

    helpers.chain([
      function(cb){ test_socket.trigger("event_1", {some_data: 11}, function(){ cb(); }); },
      function(cb){ test_socket.trigger("event_2", {some_data: 12}, function(){ cb(); }); },
      function(cb){ test_socket.trigger("event_3", {some_data: 13}, function(){ cb(); }); },
    ])(function(){ 

      var parsed = calls.map(function(call_arr){
        call_arr[1] = Array.prototype.slice.call(call_arr[1]);
        delete call_arr[1][3]; // remove the callback
        return call_arr;
      })

      assert.deepEqual(parsed, [
        ["event_1", [ test_socket,  {some_data: 11}, {} ] ],
        ["event_2", [ test_socket,  {some_data: 12}, {} ] ],
        ["event_3", [ test_socket,  {some_data: 13}, {} ] ],
      ]);

      done(); 
    });
  });

  it("Handle chained websocket event handler", function(done){
    testEnv.reset();
    var calls   = [];
    var TestApp = TestWebsocketApp.extend("TestApp", {
      listenSocket: {
        event_1: [
          function(){calls.push(["event_1_1"].concat(arguments)); arguments[2].a = 5; Array.prototype.slice.call(arguments).pop()()},
          function(){calls.push(["event_1_2"].concat(arguments)); arguments[2].b = 6; Array.prototype.slice.call(arguments).pop()()},
          function(){calls.push(["event_1_3"].concat(arguments)); arguments[2].c = 7; Array.prototype.slice.call(arguments).pop()()},
        ]
      }
    });
    var websocketApp = new TestApp(testEnv);

    var test_socket = {

      emits: [],
      emit: function(){ this.emits.push(arguments); },

      
      handlers: {},
      trigger: function(ev){ this.handlers[ev].apply(this, Array.prototype.slice.call(arguments, 1)); },
      on:      function(ev, handler){  this.handlers[ev] = handler; }

    };

    var cb_args;
    websocketApp.bindSocketEvents(test_socket);

    helpers.chain([
      function(cb){ test_socket.trigger("event_1", {some_data: 11}, function(){ cb(); }); },
    ])(function(){

      var parsed = calls.map(function(call_arr){
        call_arr[1] = Array.prototype.slice.call(call_arr[1]);
        delete call_arr[1][3]; // remove the callback
        return call_arr;
      })

      assert.deepEqual(parsed, [
        ["event_1_1", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
        ["event_1_2", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
        ["event_1_3", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
      ]);

      done(); 
    });
  });

  it("Handle concurent websocket event handler", function(done){
    testEnv.reset();
    var calls   = [];
    var TestApp = TestWebsocketApp.extend("TestApp", {
      listenSocket: {
        event_1: {
          "result_a": function(){calls.push(["event_1_1"].concat(arguments)); arguments[2].a = 5; Array.prototype.slice.call(arguments).pop()()},
          "result_b": function(){calls.push(["event_1_2"].concat(arguments)); arguments[2].b = 6; Array.prototype.slice.call(arguments).pop()()},
          "result_c": function(){calls.push(["event_1_3"].concat(arguments)); arguments[2].c = 7; Array.prototype.slice.call(arguments).pop()()},
        }
      }
    });
    var websocketApp = new TestApp(testEnv);

    var test_socket = {

      emits: [],
      emit: function(){ this.emits.push(arguments); },

      
      handlers: {},
      trigger: function(ev){ this.handlers[ev].apply(this, Array.prototype.slice.call(arguments, 1)); },
      on:      function(ev, handler){  this.handlers[ev] = handler; }

    };

    var cb_args;
    websocketApp.bindSocketEvents(test_socket);

    helpers.chain([
      function(cb){ test_socket.trigger("event_1", {some_data: 11}, function(){ cb(); }); },
    ])(function(){
      
      var parsed = calls.map(function(call_arr){
        call_arr[1] = Array.prototype.slice.call(call_arr[1]);
        delete call_arr[1][3]; // remove the callback
        return call_arr;
      })

      assert.deepEqual(parsed, [
        ["event_1_1", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
        ["event_1_2", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
        ["event_1_3", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
      ]);

      done(); 
    });
  });

  it("Handle combined nested websocket event handler", function(done){
    testEnv.reset();
    var calls   = [];
    var TestApp = TestWebsocketApp.extend("TestApp", {
      listenSocket: {
        event_1: {
          "result_a": function(){calls.push(["event_1_1"].concat(arguments)); arguments[2].a = 5; Array.prototype.slice.call(arguments).pop()()},
          "result_a_1":[
            function(){calls.push(["event_a_1_1"].concat(arguments)); Array.prototype.slice.call(arguments).pop()()},
            function(){calls.push(["event_a_1_2"].concat(arguments)); Array.prototype.slice.call(arguments).pop()()},
            function(){calls.push(["event_a_1_3"].concat(arguments)); Array.prototype.slice.call(arguments).pop()()},
          ],
          "result_b": function(){calls.push(["event_1_2"].concat(arguments)); arguments[2].b = 6; Array.prototype.slice.call(arguments).pop()()},
          "result_c": function(){calls.push(["event_1_3"].concat(arguments)); arguments[2].c = 7; Array.prototype.slice.call(arguments).pop()()},
        }
      }
    });
    var websocketApp = new TestApp(testEnv);

    var test_socket = {

      emits: [],
      emit: function(){ this.emits.push(arguments); },

      
      handlers: {},
      trigger: function(ev){ this.handlers[ev].apply(this, Array.prototype.slice.call(arguments, 1)); },
      on:      function(ev, handler){  this.handlers[ev] = handler; }

    };

    var cb_args;
    websocketApp.bindSocketEvents(test_socket);

    helpers.chain([
      function(cb){ test_socket.trigger("event_1", {some_data: 11}, function(){ cb(); }); },
    ])(function(){
      
      var parsed = calls.map(function(call_arr){
        call_arr[1] = Array.prototype.slice.call(call_arr[1]);
        delete call_arr[1][3]; // remove the callback
        return call_arr;
      })

      assert.deepEqual(parsed, [
        ["event_1_1", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],

          ["event_a_1_1", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
          ["event_a_1_2", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
          ["event_a_1_3", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],

        ["event_1_2", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
        ["event_1_3", [ test_socket,  {some_data: 11}, {a: 5, b: 6, c: 7 } ] ],
      ]);

      done(); 
    });
  });

  it("Handle simple 'do_caller' websocket event handler", function(done){
    testEnv.reset();
    var TestApp = TestWebsocketApp.extend("TestApp", {
      env: testEnv,
      listenSocket: {
        event_1: "controllers.SomeController.someMethod | socket.a, data.some_data | mount_point"
      }
    });
    var websocketApp = new TestApp(testEnv);

    var test_socket = {

      a: 123,

      emits: [],
      emit: function(){ this.emits.push(arguments); },

      
      handlers: {},
      trigger: function(ev){ this.handlers[ev].apply(this, Array.prototype.slice.call(arguments, 1)); },
      on:      function(ev, handler){  this.handlers[ev] = handler; }

    };

    var cb_args;
    websocketApp.bindSocketEvents(test_socket);

    test_socket.trigger("event_1", {some_data: 100}, function(err, result){ 
      assert.deepEqual(result, { mount_point: 'controllers.SomeController.someMethod' });
      assert.deepEqual(testEnv.do_s, [ [ 123, 100 ] ]);
      done();
    });

    testEnv.do_s.shift(); // remove log report

    testEnv.do_s.forEach(function(do_args){
      do_args.pop()(null, do_args.shift());
    });
  });

});
