
module.exports = (router, cb)->

  window.app = @
  
  @config = config
  @collections = {}
  @services = {}
  @dispatcher = _.extend {}, Backbone.Events

  run = =>
    Backbone.history.start {pushState:true, trigger:true} if @router.routes
    cb()

  @socket = io.connect()
  
  # Wait for "ready" event from server
  # Server will give a list with available services
 
  $(document).ready =>
    Router = App.Router.extend(router);
    @router = new Router();
    if @router.prepare
      @router.prepare run
    else
      run()
