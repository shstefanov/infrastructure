

1. Pages classes should have getSubject method. Infrastructure can not provide default getSubject method because it does not know where subjects collection is and what type of model subject is. The default getSubject implementation is for use in single process mode only and just gets a model from env.subjects (instance of AdvancedCollection) which id equals to session._id or creates new model (not stored in database) with unique id, then updates session object before calling callback. In single process mode it can fetch a model using env.Models using id, stored in session object. In cluster mode Pigeonry needs _id property of the session that points to subject in database (user or temporary user). It can use dataLayer to find or create one.

2. In clusterMode, definitions of child processes are defined in 'config.workers' array. This array holds object. For every object, one child process will be started, the object will be passed to the process and will override or add new properties to main config object. When process dies, it will be spawned forever with same config.
  [
    {
      type: 'http',
      port: 3000,
      address: 'http_0',
      bundler: true   // Otherwisw all of workers will build all javascript bundles
    }
  ]
  There is 'type' property. For now 'infrastructure' handles 3 types of sub-processes - 'http', 'controller', and 'data'
  It means that 'http' process will start http server at given port and will setup pages from specified in 'config.routes' destination folder. 
  Every process can setup different. Respectively, "controller" type loads controllers from 'config.controllers' destination folder
  and "data" type sets up models specified in 'config.models' destination.

  Every worker config in 'config.nodes' array must contain 'addres' property and it should be unique.

  'bundler' property is valid only for http workers and tells the worker to pack pages 'app' (the frontend app) with browserify.

  'controller' worker sets up controller. It's possible to have multiple controllerr workers with different controllers inside,
  but keep in mind that their names must be unique not only inside the worker, but for entire application.

  Root process will try to "match" established socket connection with specified in page.controllers array controllers
  and will forward events and callbacks from controller to client and from client to controllers

  'data' worker sets up models. As in 'controllers', if multiple data workers are spawned, model names must be unique
  If 'loadModels' property is set in worker configuration, a env.Models namespace will be filled with clones of cpecified Models.
  Possible values are "all", which will load all available models or array with model names.
  If data worker tries to load models, it will avoid it's own models and will setup only these from other data workers