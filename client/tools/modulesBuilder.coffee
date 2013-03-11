
module.exports = (modules, cb)->

  app.modules = {};

  modules_counter = Object.keys(App.Modules).length;

  if(modules_counter == 0)
    cb()
    return

  counter = Object.keys(App.Modules).length
  cb() if counter is 0
  for name, mod of App.Modules
    app.module[name] = new mod()
    counter--
    cb() if counter is 0
