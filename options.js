
module.exports = {
  test_mode:"application", //"application" for loading app tests
  tests_location: __dirname+"/tests",
  test_options:{
    console:true,
    html:false,
    levelStep: 2,
    timeout:4000
  }
};
