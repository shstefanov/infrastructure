module.exports = function(cb){
  var env    = this;
  env.structureLoader("pages", function setupPages(name, Page){
    Page.prototype.env  = env;
    if(!Page.prototype.root) Page.prototype.root = "/"+name;
    return new Page(env);
  }, cb, true );

};
