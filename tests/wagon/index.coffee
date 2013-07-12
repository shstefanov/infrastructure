
module.exports = (suite, context)->
  {Wagon} = context
  wagon = null


  suite.about "Creating wagon", (next)->
    
    wagon = new Wagon()
    
    suite.test("Store present", typeof wagon.cargo, "object")
    
    next()
 

  suite.about "Creating wagon with options", (next)->
    
    wagon = new Wagon({defaultType:{}, cargo:{something:5}})
    
    suite.test("Store options - defaultType", typeof {}, typeof wagon.defaultType)
    suite.test("Store options - cargo", typeof {something:5}, typeof wagon.cargo)
    suite.test("Store options - cargo content", 5, wagon.cargo.something)
    
    next()


  suite.about "Pushing some values in wagon", (next)->
    
    wagon = new Wagon({defaultType:[]})
    
    wagon.push("animals").last({fish:"aaalll"})
    suite.test("Data present in cargo", wagon.cargo.animals[0].fish, "aaalll")
    
    wagon.push({horse:"whaa", eagle:"high"})
    suite.test("Complex data horse present in cargo", wagon.cargo.horse[0], "whaa")
    suite.test("Complex data eagle present in cargo", wagon.cargo.eagle[0], "high")
    
    wagon.push({horse:"lowel", eagle:"sharp"})
    suite.test("More complex data horse present in cargo", wagon.cargo.horse[1], "lowel")
    suite.test("More complex data eagle present in cargo", wagon.cargo.eagle[1], "sharp")
    
    next()




