
module.exports = (router, cb)->
  $(document).ready =>
    Router = App.Router.extend(router);
    app.router = new Router();
    cb()