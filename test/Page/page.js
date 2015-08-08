var _      = require("underscore");
var assert = require("assert");
var Page   = require("../../lib/Page.js");

var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");
describe("Page" + currentFileMark, function(){

  var TestPage = Page.extend("TestPage", {
    root: "/test"
  });

  it("Page pre handler", function(next){

    var PageWithPre = TestPage.extend("PageWithPre", {
      pre: function(){}
    });

    var routes = {
      all:     {},
      get:     {},
      post:    {},
      put:     {},
      delete:  {},
    };

    var page = new PageWithPre({
      i: {do: function(){}},
      engines: {
        express: {
          all:     function(route, handler){ routes.all[route]    = handler; },
          get:     function(route, handler){ routes.get[route]    = handler; },
          post:    function(route, handler){ routes.post[route]   = handler; },
          put:     function(route, handler){ routes.put[route]    = handler; },
          delete:  function(route, handler){ routes.delete[route] = handler; },
        }
      }
    });

    assert.equal    (typeof routes.all["/test*"], "function");
    assert.deepEqual(routes.get,    {});
    assert.deepEqual(routes.post,   {});
    assert.deepEqual(routes.put,    {});
    assert.deepEqual(routes.delete, {});

    next();
  });

  it("Page after handler", function(next){

    var PageWithAfter = TestPage.extend("PageWithAfter", {
      after: function(){}
    });

    var routes = {
      all:     {},
      get:     {},
      post:    {},
      put:     {},
      delete:  {},
    };
    var page = new PageWithAfter({
      i: {do: function(){}},
      engines: {
        express: {
          all:     function(route, handler){ routes.all[route]    = handler; },
          get:     function(route, handler){ routes.get[route]    = handler; },
          post:    function(route, handler){ routes.post[route]   = handler; },
          put:     function(route, handler){ routes.put[route]    = handler; },
          delete:  function(route, handler){ routes.delete[route] = handler; },
        }
      }
    });

    assert.equal    (typeof routes.all["/test*"], "function");
    assert.deepEqual(routes.get,    {});
    assert.deepEqual(routes.post,   {});
    assert.deepEqual(routes.put,    {});
    assert.deepEqual(routes.delete, {});

    next();
  });

  it("Page with route handlers", function(next){

    var PageHandlers = TestPage.extend("PageHandlers", {
      "GET /something":    function(){},
      "POST /something":   function(){},
      "PUT /something":    function(){},
      "DELETE /something": function(){},
      "ALL /something":    function(){},
    });

    var routes = {
      all:     {},
      get:     {},
      post:    {},
      put:     {},
      delete:  {},
    };
    
    var page = new PageHandlers({
      i: {do: function(){}},
      engines: {
        express: {
          all:     function(route, handler){ routes.all[route]    = handler; },
          get:     function(route, handler){ routes.get[route]    = handler; },
          post:    function(route, handler){ routes.post[route]   = handler; },
          put:     function(route, handler){ routes.put[route]    = handler; },
          delete:  function(route, handler){ routes.delete[route] = handler; },
        }
      }
    });

    assert.equal    (typeof routes.all     ["/test/something"], "function");
    assert.equal    (typeof routes.get     ["/test/something"], "function");
    assert.equal    (typeof routes.post    ["/test/something"], "function");
    assert.equal    (typeof routes.put     ["/test/something"], "function");
    assert.equal    (typeof routes.delete  ["/test/something"], "function");

    next();
  });

  it("Page set template in prototype", function(next){

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    function(req, res) { this.render(req, res); }
    });

    var handler;
    var page = new PageHandlers({
      i: {do: function(){}},
      engines: {
        express: {
          get: function(route, _handler){ handler = _handler },
        }
      }
    });

    handler.call(page, {}, {
      render: function(template_name, data){
        assert.equal(template_name, "template_name");
        next();        
      }
    });
  });

  it("Page string handler should become template render function", function(next){

    var PageHandlers = TestPage.extend("PageHandlers", {
      "GET /something":    "template_name"
    });

    var handler;
    var page = new PageHandlers({
      i: {do: function(){}},
      engines: {
        express: {
          get: function(route, _handler){ handler = _handler },
        }
      }
    });

    handler.call(page, {}, {
      render: function(template_name, data){
        assert.equal(template_name, "template_name");
        next();        
      }
    });
  });

  it("Handler with array should chain", function(next){

    var handler;

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    [
        function( req, res, next ){ res.data = { first: 1 }; next(); },
        function( req, res       ){ this.render(req, res);           },
      ]
    });

    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: {do: function(){}},
      engines: {
        express: {
          get: function(route, _handler){ handler = _handler; },
        }
      }
    });

    var test_req = {};
    var test_res = {
      render: function(template_name, data){
        assert.equal(template_name, "template_name");
        assert.equal(data.first, 1);
        next();        
      }
    };
    handler(test_req, test_res, function(err){
      assert.equal(err, null);
      next();
    });
  });

  it("Array handler containing not trailing simple string should render specific template", function(next){

    var handler_index = 0, parsed_handlers = [];
    function next_handler(){
      parsed_handlers[handler_index++].call( page, test_req, test_res, next_handler );
    }

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    [
        "other_template",
        function(req, res){
          res.data.param = 5;
          this.render(req, res);
        }
      ]
    });

    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: {do: function(){}},
      engines: {
        express: {
          get: function(route, _handler){  parsed_handlers.push(_handler); },
        }
      }
    });

    var test_req = {};
    var test_res = {
      render: function(template_name, data){
        assert.equal(template_name, "other_template");
        assert.equal(data.param, 5);
        next();        
      }
    };
    next_handler();
  });

  it("Array handler containing trailing simple string should render specific template", function(next){

    var handler_index = 0, parsed_handlers = [];
    function next_handler(){
      parsed_handlers[handler_index++].call( page, test_req, test_res, next_handler );
    }

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    [
        function(req, res, next){
          res.data = { param: 6 };
          setTimeout(next, 20);
        },
        "other_template"
      ]
    });

    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: {do: function(){}},
      engines: {
        express: {
          get: function(route, _handler){  parsed_handlers.push(_handler); },
        }
      }
    });

    var test_req = {};
    var test_res = {
      render: function(template_name, data){
        assert.equal(template_name, "other_template");
        assert.equal(data.param, 6);
        next();        
      }
    };
    next_handler();
  });

  it("Array handler containing not simple string (containing '.') should call env.do", function(next){

    var handler;

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    [
        "some_target.something.some_method | req.url, req.param | some_result",
        "other_template"
      ]
    });

    var do_params = [];
    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: { do: function(){
        var args = Array.prototype.slice.call(arguments);
        if(typeof args[ args.length - 1 ] === "function"){
          var cb = args.pop();
          setTimeout(function(){ cb( null, 44 ); }, 20 );
        }
        do_params.push(args);
      }},
      engines: {
        express: { get: function(route, _handler){ handler = _handler; }, }
      }
    });

    var test_req = { url: "some_url", param: "some_param" };
    var test_res = {
      render: function(template_name, data){
        assert.equal(template_name, "other_template");
        assert.deepEqual(do_params, [
          [ "log.sys", "route", "GET    /test/something" ], // gives report when binding route
          [ "some_target.something.some_method", "some_url", "some_param"]
        ]);
        assert.equal(data.some_result, 44);
        next();        
      }
    };
    handler(test_req, test_res , function(){ 
      // This callback will be never called, because chain finishes with template renderer function which is not calling 'next' 
    });
  });

  it("Object handler should call amap helper", function(next){

    var handler;

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    {
        result_a :        function( req, res, next ){ setTimeout(function(){ res.data.result_a = 5; next(); }, 20 ); },
        result_b :        function( req, res, next ){ setTimeout(function(){ res.data.result_b = 6; next(); }, 20 ); },
        "resultc.d.e.f" : function( req, res, next ){ setTimeout(function(){ page.env.helpers.patch(res, "data.result_c.d.e.f", 10); next(); }, 20); },
      }
    });

    var do_params = [];
    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: {do: function(){
        var args = Array.prototype.slice.call(arguments);
        if(typeof args[ args.length - 1 ] === "function"){
          var cb = args.pop();
          setTimeout(function(){
            cb(null, {some_result: 44});
          }, 20 );
        }
        do_params.push(args);
      }},
      engines: {
        express: {
          get: function(route, _handler){  handler = _handler; },
        }
      }
    });

    var test_req = {url: "some_url", param: "some_param" };
    var test_res = {
      render: function(template_name, data){
        assert.equal( template_name,        "template_name"  );
        assert.equal( data.result_a,        5                );
        assert.equal( data.result_b,        6                );
        assert.equal( data.result_c.d.e.f,  10               );
        next(); // Ensure result is rendered
      }
    };
    handler(test_req, test_res , function(){ 
      // Here is no template rendering handler, so callback will be called
    });
  });

  it("Object handler with 'doCallers'", function(next){

    var handler;

    var doHandlers = {
      "some_target.some_group_some_method": function(url, param, cb){
        cb(null,  { url: url+"_", param: param+"_", result_from: "some_target.some_group_some_method" } );
      },

      "some_target.some_group_some_method_b": function(foo, bar, cb){
        cb(null,  { foo: foo+"+", bar: bar+"+", result_from: "some_target.some_group_some_method_b" } );
      }
    };


    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something":    {
        result_a :         function(req, res, next){ res.data.result_a = 5; setTimeout(function(){ next( null ); }, 20 ); },
        "result_b.d.e.f" : "some_target.some_group_some_method_b | req.foo, req.bar",
        "result_c.d.e.f" : "some_target.some_group_some_method   | req.url, req.param",
      }
    });

    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: { do: function(){
        var args = Array.prototype.slice.call(arguments);
        if(typeof args[ args.length - 1 ] === "function" && doHandlers[args[0]]){
          setTimeout(function(){ doHandlers[args[0]].apply( this, args.slice(1) ) }, 20 );
        }
      }},
      engines: {
        express: {
          get: function(route, _handler){  handler = _handler; },
        }
      }
    });

    var test_req = { url: "some_url", param: "some_param", foo: "foo_val", bar: "bar_val" };
    var test_res = {
      render: function(template_name, data){
        assert.equal     (template_name, "template_name");
        assert.equal     (data.result_a, 5);
        
        assert.deepEqual (data.result_b.d.e.f, {
          foo: "foo_val+", bar: "bar_val+", result_from: "some_target.some_group_some_method_b" 
        });
        assert.deepEqual (data.result_c.d.e.f, { 
          url: "some_url_", param: "some_param_", result_from: "some_target.some_group_some_method" 
        });
        next();
      }
    };
    handler( test_req, test_res , function(){ /*next();*/ });
  });

  it("Complex routing case", function(next){

    var handler;

    function createDoTargets( val, path ){
      return function( param1, param2, cb ){
        setTimeout(function(){
          cb(null, _.object( [ [param1, param2],  val , [ "result_from", path ] ] ) );
        }, 20 );
      };
    }

    var doHandlers = _.mapObject({
      "target.object.method_1" : [ "value", 1 ],
      "target.object.method_2" : [ "value", 2 ],
      "target.object.method_3" : [ "value", 3 ],
      "target.object.method_4" : [ "value", 4 ],
      "target.object.method_5" : [ "value", 5 ],
      "target.object.method_6" : [ "value", 6 ],
      "target.object.method_7" : [ "value", 7 ],
      "target.object.method_8" : [ "value", 8 ],
    }, createDoTargets );

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something": [
        "other_template",
        "target.object.method_1 | \"aaa\", req.value + 1 | arr1.first",
        "target.object.method_2 | \"bbb\", req.value + 2 | arr1.second",
        function(req, res, next){
          res.data.arr1.fn = "from function";
          next();
        },
        "target.object.method_3 | \"ccc\", req.value + 3 | arr1.third",

        {
          "arr1.obj1.first":  "target.object.method_4 | \"ddd\", req.value + 4",
          "arr1.obj1.second": "target.object.method_5 | \"eee\", req.value + 5",
          someStrangeKey: [
            "target.object.method_6 | \"fff\", req.value + 6 | arr1.obj1.chain1.first",
            function(req, res, next){
              res.data.arr1.obj1.chain1.fn = "from function on obj -> chain";
              next();
            },
            [
              "target.object.method_7 | \"ggg\", req.value + 7 | arr1.obj1.chain1.subchain.first",
              "target.object.method_8 | \"hhh\", req.value + 8 | arr1.obj1.chain1.subchain.second",
            ]
          ]
        }
      ]
    });

    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: { 
        do: function(){
          var args = Array.prototype.slice.call(arguments);
          if( typeof args[ args.length - 1 ] === "function" && doHandlers[ args[ 0 ] ] ){
            doHandlers[ args[ 0 ] ].apply( this, args.slice( 1 ) );
          }
        }
      },
      engines: { express: { get: function(route, _handler){  handler = _handler; } } }
    });

    var test_req = { value: 0 };
    var test_res = {
      render: function(template_name, data){
        data = _.omit(data, ["meta", "javascripts", "styles", "config", "title", "cache"]);
        assert.deepEqual(data, {
          template: "other_template",
          arr1: { 
            first:  { aaa: 1, value: 1, result_from: 'target.object.method_1' },
            second: { bbb: 2, value: 2, result_from: 'target.object.method_2' },
            fn:    "from function",
            third:  { ccc: 3, value: 3, result_from: 'target.object.method_3' },
            obj1: {
              first:  { ddd: 4, value: 4, result_from: 'target.object.method_4' },
              second: { eee: 5, value: 5, result_from: 'target.object.method_5' },
              chain1: {
                first:  { fff: 6, value: 6, result_from: 'target.object.method_6' },
                fn:     "from function on obj -> chain",
                subchain: {
                  first:  { ggg: 7, value: 7, result_from: 'target.object.method_7' },
                  second: { hhh: 8, value: 8, result_from: 'target.object.method_8' },
                }
              }
            }
          }
        });

        next();
      }
    };
    handler( test_req, test_res , function(){ /*next();*/ });
  });

  it("Case with single simple string in array", function(next){

    var handler;

    var PageHandlers = TestPage.extend("PageHandlers", {
      template: "template_name",
      "GET /something": [
        "other_template",
      ]
    });

    var page = new PageHandlers({
      helpers: require("../../lib/helpers.js"),
      i: { 
        do: function(){
          var args = Array.prototype.slice.call(arguments);
          if( typeof args[ args.length - 1 ] === "function" && doHandlers[ args[ 0 ] ] ){
            doHandlers[ args[ 0 ] ].apply( this, args.slice( 1 ) );
          }
        }
      },
      engines: { express: { get: function(route, _handler){  handler = _handler; } } }
    });

    var test_req = {  };
    var test_res = {
      render: function(template_name, data){
        assert.equal     (template_name, "other_template");
        next();
      }
    };
    handler( test_req, test_res , function(){ next(); });
  });


});
