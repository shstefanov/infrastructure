
module.exports = (modules, cb)->

  app.modules = {};

  modules_counter = Object.keys(App.Modules).length;

  if(modules_counter == 0)
    cb()
    return

  counter = Object.keys(App.Modules).length
  cb() if counter is 0
  for n, m of App.Modules
    i = new m()
    app.modules[i.name] = i
    counter--
    cb() if counter is 0
