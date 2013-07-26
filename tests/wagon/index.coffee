
Wagon = require "../../lib/utils/wagon"

module.exports = (suite)->
 
  wagon = null

  suite.description "Testing wagon class"

  suite.about "Creating wagon", (next)->
    wagon = new Wagon()
    suite.test "Wagon present", typeof wagon, "object"
    suite.test "Store present", typeof wagon.cargo, "object"
    next()
 
  suite.about "Creating and testing new wagon data type - array", (next)->
    
    wagon.create("horses", "array")
    suite.isArray("horses in cargo is array", wagon.get("horses").all())
    suite.isEqual("horses in cargo is empty", wagon.get("horses").all(), [])
    
    #Push
    wagon.push("horses").first("henry")
    suite.isEqual "horses in cargo is equal to ['henry']"
    , wagon.get("horses").all()
    , ["henry"]

    wagon.push("horses").first(['lowel', 'ken'])
    suite.isEqual "horses in cargo is equal to ['lowel', 'ken', 'henry']"
    , wagon.get("horses").all()
    , ['lowel', 'ken', 'henry']

    wagon.push("horses").last(['ben', 'ten'])
    suite.isEqual "horses in cargo is equal to ['lowel', 'ken', 'henry', 'ben', 'ten']"
    , wagon.get("horses").all()
    , ['lowel', 'ken', 'henry', 'ben', 'ten']

    wagon.push("horses").at(2, ['john', 'hank'])
    suite.isEqual "horses in cargo is equal to ['lowel', 'ken','john', 'hank', 'henry', 'ben', 'ten']"
    , wagon.get("horses").all()
    , ['lowel', 'ken','john', 'hank', 'henry', 'ben', 'ten']

    #Get
    result = wagon.get("horses").all()
    suite.isEqual "Fetched data should equals stored data"
    , result
    , wagon.get("horses").all()

    suite.isNotSame "Fetched data should not be same object as stored data"
    , result
    , wagon.get("horses").all()

    wagon.create "eagles", "array"
    wagon.push("eagles").first([{a:1 , b:10 },{a:1 , b:20 },{a:2 , b:10 },{a:2 , b:20 },{a:3 , b:30 }])
    result = wagon.get("eagles").where({a:2})
    suite.isEqual "should fetch objects by pattern", result, [{a:2 , b:10 },{a:2 , b:20 }]
    for i, v of result
      suite.isEqual("should be the same value", v, wagon.get("eagles").at(parseInt(i)+2))
      suite.isNotSame("should be copy of objects", v, wagon.get("eagles").at(parseInt(i)+2))

    result = wagon.get("eagles").where({a:1,b:20})
    suite.isEqual "should fetch objects by pattern", result, [{a:1 , b:20 }]

    result = wagon.get("eagles").where([{a:1}, {b:10}])
    test_result = [{a:1 , b:10 },{a:1 , b:20 },{a:2 , b:10 }]
    suite.isEqual "should fetch objects by pattern", result, test_result

    result = wagon.pull("eagles").where([{a:1}, {b:10}])
    test_result = [{a:1 , b:10 },{a:1 , b:20 },{a:2 , b:10 }]
    test_rest = [{a:2 , b:20 },{a:3 , b:30 }]
    suite.isEqual "should pull objects by pattern", result, test_result
    suite.isEqual "rest in store should be reduced as"
    ,wagon.get("eagles").all(), test_rest

    
    next()

  suite.about "Pushing some values in wagon", (next)->
    next()

  suite.about "Pull data from wagon", (next)->
    next()

    

