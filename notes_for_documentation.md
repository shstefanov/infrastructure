Queries
=======


MysqlLayer and PostgresLayer
==========

  ---
    // Create a record
    env.i.do("data.Blueprint.create", {
      path: "test.path",
      alalala:333,
      name: "Some name",
    }, function(err, record){
      console.log("data.Blueprint.create", record);
    });
  
  ---

    // Find all records
    env.i.do("data.Blueprint.find", function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Find one record by id
    env.i.do("data.Blueprint.find", 5, function(err, record){
      console.log("????", record);
    });

  ---

    // Find multiple records by array of ids
    env.i.do("data.Blueprint.find", [5,6,7], function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Find multiple records by condition
    env.i.do("data.Blueprint.find", {
      name: ["NOT IN", '1434118856493', 1434118849186], // 1434118849186 || [ 1434118849186, 1434118849186 ] || [">=", 1434118849186, 1434118849186 ]
      path: 'test.path'
    }, function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Find multiple records by condition and some options
    env.i.do("data.Blueprint.find", {
      name: [">", 0], // 1434118849186 || [ 1434118849186, 1434118849186 ] || [">=", 1434118849186, 1434118849186 ]
      path: 'test.path'
    }, {
      limit: [3, 3],
      order: ["name", "DESC"]
    }, function(err, records){
      console.log("data.Blueprint.find", records);
    });

  ---

    // Update record
    env.i.do("data.Blueprint.update", {
      // if primaryKey provided - only one record will be updated
      name: [">", 0], // varriants: 1434118849186 || [ 1434118849186, 1434118849186 ] || [">=", 1434118849186, 1434118849186 ]
      path: 'test.path'
    }, {
      // where: { ... } - if omitted, all records will be updated, otherwise where clause will be generated
      limit: [3, 3],
      order: ["name", "DESC"]
    }, function(err, result){
      console.log("data.Blueprint.update", result);
    });
  
  ---

    // Delete all record
    env.i.do("data.Blueprint.delete", function(err, result){
      console.log("data.Blueprint.delete", result);
    });

    // Delete one record by id
    env.i.do("data.Blueprint.delete", 15, function(err, result){
      console.log("data.Blueprint.delete", result);
    });

    // Delete with where condition
    env.i.do("data.Blueprint.delete", field: value, otrherField: ["Between"], function(err, result){
      console.log("data.Blueprint.delete", result);
    });

RedisLayer
==========

  ---
    // Create record
    env.i.do("data.Cache.create", {alabala: 535353, value: {
      something: 5,
      other: Date.now()
    }}, function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });


  ---

    // Get all records
    env.i.do("data.Cache.find", function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

    // Get record by id
    env.i.do("data.Cache.find", 11, {fields: ["value"]},  function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

    // Get records by array of ids
    env.i.do("data.Cache.find", [10,11,12,13], {fields: ["value"]},  function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

    // Find with 'fields' option
    env.i.do("data.Cache.find", [123,234], {fields: ["field1", "field2"]}, function(err, result){
      if(err) return env.i.do("log.error", "data.Cache.create - test", err);
      else{
        console.log("success", result);
      }
    });

  ---

    
    // Update single record
    env.i.do("data.Cache.update", {field: value, primaryKey: 12}, function(err, result){
      console.log("success: delete", arguments);
    });

    // Update multiple records
    env.i.do("data.Cache.update", [
     {field: value, primaryKey: 12},
     {field: value, primaryKey: 13},
     {field: value, primaryKey: 14},
     {field: value, primaryKey: 15},
    ], function(err, result){
      console.log("success: update", arguments);
    });

    // Delete all records
    env.i.do("data.Cache.update", null, function(err, result){
      console.log("success: update", arguments);
    });

  ---

    // Delete single record
    env.i.do("data.Cache.delete", 11, function(err, result){
      console.log("success: delete", arguments);
    });

    // Delete multiple records
    env.i.do("data.Cache.delete", [11, 12, 13], function(err, result){
      console.log("success: delete", arguments);
    });

    // Delete all records
    env.i.do("data.Cache.delete", null, function(err, result){
      console.log("success: delete", arguments);
    });

  ---

ElasticLayer
============


  Create record in the index
    env.i.do("data.Posts.create", {
      // post_id:        "---", // will be omited
      user_id:        "user_id",
      title:          "title",
      created_at:     "created_at",
      updated_at:     "updated_at",
      body:           "body"
    }, function(err, post){
      console.log("data.Posts.create:::", post);
    });

  ---

  Get all from this index
    env.i.do("data.Posts.find", function(err, posts){
      console.log("data.Posts.find:::", posts);
    });

  Get by id
    env.i.do("data.Posts.find", 'RcW9mjKbSkSuUNC6t3nCtg', function(err, posts){
      console.log("data.Posts.find:::", posts);
    });

  Get by list of ids
    env.i.do("data.Posts.find", ['L-vuDpi-Qj297X-LlUHzDA', 'lw8wr96aRb2H6vSTULM8RA'], function(err, posts){
      console.log("data.Posts.find:::", posts);
    });

  Get by elastic query  search (will be addes as body)
  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
    env.i.do("data.Posts.find", {
      query: {
        match: {
          created_at: 'created_at'
        }
      }
    }, function(err, posts){
      console.log("data.Posts.find:::", posts);
    });


  Get by elastic multimle query  search (will be addes as body) 
  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-msearch
  If there is {type: "type"}, will be extended with index
  otherwise will prepend the query with index: indexName
    env.i.do("data.Posts.find", [
      {query: { match: { created_at: 'created_at' } } },
      {query: { match: { updated_at: 'updated_at' } } },
    ], function(err, posts){
      console.log("data.Posts.find:::", posts);
    });

  ---

  Update single document (if primary key is provided)
  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-update
    env.i.do("data.Posts.update", { 
      user_id: 'user_id_updated_'+Date.now(),  
      title: 'updated title',                         
      created_at: 'created_at',               
      updated_at: 'updated_at',               
      body: 'body',                           
      post_id: 'RcW9mjKbSkSuUNC6t3nCtg' 
    }, function(err, posts){
        if(err) return console.log("data.Posts.update:::error", err);
      console.log("data.Posts.mass update:::", posts);
    });


  Update multiple documents (if no 'where' in options - will update all documents in index)
  'where' shuld be argument like in find - single id, array of id-s, search pattern
    env.i.do("data.Posts.update", { 
     updated_at: 'updated_at',               
    }, function(err, posts){
      if(err) return console.log("data.Posts.update:::error", err);
      console.log("data.Posts.update:::mass update", posts);
    });


  Update multiple documents (array of docuyments, containing id attribute every)
  'where' in options shuld be argument like in find - single id, array of id-s, search pattern ...
    env.i.do("data.Posts.update", { 
     updated_at: 'updated_at',               
    }, {where:  'find query here'  }, function(err, posts){
      if(err) return console.log("data.Posts.update:::error", err);
      console.log("data.Posts.update:::mass update", posts);
    });

  Update multiple models as array
    env.i.do("data.Posts.update", [ { title: 'Mass updated title', post_id: 'qP5_KoDdSlONZrTwT4qghw' },
      {aaa: 444, title: 'Mass updated test invalid props', post_id: 'lw8wr96aRb2H6vSTULM8RA' },
      {aaa: 444, title: 'Mass updated test invalid props', post_id: 'HoE2yEv-RS-ErfFT_dK2nQ' },
      {aaa: 444, title: 'Mass updated test invalid props', post_id: '7U_ElH90R1-oH9lXhAsXQA' },
    ], function(err, updated){
      if(err) return console.log("error: ", err);
      console.log("data.Posts.update:::mass update", updated );
    });

  ---

  Delete single record by id
    env.i.do("data.Posts.delete", '7U_ElH90R1-oH9lXhAsXQA', function(err, result){
      console.log("delete: ", arguments);
    });
  or by object, containing with primaryKey
    env.i.do("data.Posts.delete", {post_id: '7U_ElH90R1-oH9lXhAsXQA'}, function(err, result){
      console.log("delete: ", arguments);
    });

  if object does not contain id - delete by query
  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-deletebyquery
    env.i.do("data.Posts.delete", {query: {...}}, function(err, result){
      console.log("delete: ", arguments);
    });
