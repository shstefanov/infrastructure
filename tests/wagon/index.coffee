
Wagon = require "../../lib/utils/wagon"

module.exports = (suite)->
 
  wagon = null

  suite.description "Testing wagon class"

  suite.about "Creating wagon", (next)->
    wagon = new Wagon()
    suite.test "Wagon present", typeof wagon, "object"
    suite.test "Store present", typeof wagon.cargo, "object"
    next()
 
  suite.about "Creating and testing wagon data type - array", (next)->
    
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

  suite.about "Creating and testing wagon data type - string", (next)->
    
    wagon.create("text", "string")
    suite.test "Created data type in store should be empty string", wagon.get("text").all(), ""

    wagon.push("text").first("12345")
    suite.test "push first (initial)", wagon.get("text").all(), "12345"

    wagon.push("text").first("000_001")
    suite.test "push first"
    , wagon.get("text").all(), "000_00112345"

    wagon.push("text").last("222_333")
    suite.test "push last"
    , wagon.get("text").all(), "000_00112345222_333"

    wagon.push("text").after("_0", ":::")
    suite.test "push after"
    , wagon.get("text").all(), "000_0:::0112345222_333"

    wagon.push("text").afterAll("_", ";")
    suite.test "push afterAll"
    , wagon.get("text").all(), "000_;0:::0112345222_;333"

    wagon.push("text").before(";0", "(())")
    suite.test "push before"
    , wagon.get("text").all(), "000_(());0:::0112345222_;333"

    wagon.push("text").beforeAll(";", "--->")
    suite.test "push beforeAll"
    , wagon.get("text").all(), "000_(())--->;0:::0112345222_--->;333"

    wagon.push("text").replace("0", "N>")
    suite.test "push replace"
    , wagon.get("text").all(), "N>00_(())--->;0:::0112345222_--->;333"

    wagon.push("text").replaceAll("---", "GGG")
    suite.test "push replaceAll"
    , wagon.get("text").all(), "N>00_(())GGG>;0:::0112345222_GGG>;333"

    res = wagon.pull("text").before("((")
    suite.test "pull before", res, "N>00_"

    res = wagon.pull("text").beforeWith(")G")
    suite.test "pull beforeWith", res, "(())G"

    res = wagon.pull("text").after("G>;3")
    suite.test "pull after", res, "33"

    res = wagon.pull("text").afterWith("_G")
    suite.test "pull afterWith", res, "_GGG>;3"
    
    res = wagon.pull("text").between(":0", "45")
    suite.test "pull between", res, "1123"

    res = wagon.pull("text").betweenWith(";0", ":0")
    suite.test "pull betweenWith", res, ";0:::0"
    
    res = wagon.pull("text").all()
    suite.test "pull all", res, "GG>45222"

    suite.isEqual "'text' store must be empty string", wagon.get("text").all(), ""

    wagon.push("text").first "N>00_(())GGG>;0:::0112345222_GGG>;333"
    suite.test "wagon must be full string", wagon.get("text").all(), "N>00_(())GGG>;0:::0112345222_GGG>;333"

    res = wagon.get("text").before("((")
    suite.test "get before", res, "N>00_"

    res = wagon.get("text").beforeWith(")G")
    suite.test "get beforeWith", res, "N>00_(())G"

    res = wagon.get("text").after("G>;3")
    suite.test "get after", res, "33"

    res = wagon.get("text").afterWith("_G")
    suite.test "get afterWith", res, "_GGG>;333"
    
    res = wagon.get("text").between(":0", "45")
    suite.test "get between", res, "1123"

    res = wagon.get("text").betweenWith(";0", ":0")
    suite.test "get betweenWith", res, ";0:::0"

    suite.isEqual "text store must be empty string", wagon.get("text").all(), "N>00_(())GGG>;0:::0112345222_GGG>;333"

    next()
