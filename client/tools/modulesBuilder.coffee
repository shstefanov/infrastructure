
module.exports = (modules, cb)->

  app.modules = {};

  modules_counter = Object.keys(App.Modules).length;

  if(modules_counter == 0)
    cb()
    return

  counter = Object.keys(App.Modules).length
  for n, m of App.Modules
    i = new m()
    app.modules[i.name] = i
    console.log "------------build module---------------", i.name
    counter--
    cb() if counter is 0
