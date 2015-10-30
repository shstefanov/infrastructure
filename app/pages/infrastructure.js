module.exports = function(){
  var env = this;
  return env.classes.Page.extend("InfrastructurePage", env.config.pages.infrastructure);
};
