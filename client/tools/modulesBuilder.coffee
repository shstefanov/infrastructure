
module.exports = (modules, cb)->

  app.modules = {};

  modules_counter = Object.keys(App.Modules).length;

  if(modules_counter == 0)
    cb()
    return

  counter = Object.keys(App.Modules).length
  for n, m of App.Modules
    console.log "------------building module-----------", n
    i = new m()
    console.log "------------module built---------------", n
    app.modules[i.name] = i
    counter--
    cb() if counter is 0
